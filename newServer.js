const express = require('express');
const ws = require('ws'); 
const app = express(); //express app
const session = require('express-session'); //express sessions
const uuid = require('uuid');
const port = process.env.PORT || 5000; 
const mongo = require('./mongoDatabase.js');
const cors = require('cors');
const checkerValidator = require('./backendCheckValidation.js');
const validationConverter = require('./frontend/src/components/validation/validationConverter.js');
const newSocketHandler = require('./newSocketHandler.js');

const { parse } = require('uuid');


const mongoClient = mongo.client;
const mongoRepClient = mongo.client_replica;


// This displays message that the server running and listening to specified port
const expressServer = app.listen(port, () => console.log(`Listening on port ${port}`));

//Session stuff:
const express_session = session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
  });


//Random ID generator for rooms:
const id_generator = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ret = ''
  for (let i = 0; i < 5; i++) {
      ret += chars[Math.round(Math.random()*61)]
    }
  return ret
}


//MONGODB Queries:

const mongoDBsearch = async (query) => {
  await mongoClient.connect();
  const db = mongoClient.db('checker_db');
  //Search query:
  const collection = db.collection(query[0]);
  // const query_result = await collection.find(query[1]).toArray();
  return await collection.find(query[1]).toArray();
  
}


const mongoDBinsert = async (query) => {
    await mongoClient.connect();
    const db = mongoClient.db('checker_db');
    //Actual insert query:
    const collection = db.collection(query[0]);
    await collection.insertOne(query[1]);
    return 'Db successed!'
}

const mongoDBremove = async (query) =>{
    await mongoClient.connect();
    const db = mongoClient.db('checker_db');
    
    const collection = db.collection(query[0]);
    await collection.deleteOne(query[1]);
}

  //col: Collection to update, 
  //filter: Which entries in collection to update 
  //update: What to actually change 
  //Options: Mongo params you can set
const mongoDBupdate = async (col, filter, update, options) => { 
  console.log('mongo update?')
  await mongoClient.connect();
  const db = mongoClient.db('checker_db');
  const collection = db.collection(col);
  const result = await collection.updateOne(filter,update,options);
  console.log(result);
  console.log('[mongoDBupdate]: Success!')
  return
}

const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', (socket,ws_request) => {
    console.log('WS connected');
    //Instance of session, add property to socket:
    express_session(ws_request, {}, () => {
      socket.sess_id = ws_request.session.uuid
      console.log('WS SESSION: '+ws_request.session.uuid)
      console.log('# WS Clients: ' + wsServer.clients.size.toString())


    });

  socket.on('message', async (data) => {
    //ParsedData sent back:
    const parsedData = JSON.parse(data.toString());
    
    socket.send(await newSocketHandler.OnMessage(parsedData,ws_request,mongoClient) );


  });
});

const mongoMonitor = async (pipeline) => {
  await mongoRepClient.connect();
  const collection = mongoRepClient.db('checker_db').collection('rooms');
  const changeStream = collection.watch(pipeline)

  changeStream.on('change', async (next) => {
    console.log(next);

    //If the guest_session property is updated: (Guest has authenticated):
    if(next.updateDescription.updatedFields.guest_session){
      //Find corresponding table:
      const findRoom = await mongoDBsearch(['rooms',{guest_session: next.updateDescription.updatedFields.guest_session}]);
      console.log(findRoom)

      for(const c of wsServer.clients ){
        if(c.sess_id == findRoom[0].admin_session){
          c.send(JSON.stringify({guest_auth : true, game_board: findRoom[0].game_board}))
        }
      }


    }

    if(next.updateDescription.updatedFields.game_board){

      const findRoom = await mongoDBsearch(['rooms',{_id: next.documentKey._id}]);
      console.log(findRoom)

      for(const c of wsServer.clients){
        
        if(c.sess_id === findRoom[0].admin_session || c.sess_id === findRoom[0].guest_session){
          c.send(JSON.stringify({action_type: 'movementResult',perm: c.sess_id === findRoom[0].admin_session ? true : false,game_board: findRoom[0].game_board, turn : findRoom[0].turn}));

        }
      }


      console.log('game board has been edited')

    }

    //console.log(next.documentKey._id) //Room code (5 char randomized)
    //console.log(next.updateDescription.updatedFields.guest_session) //Guest Session Key

  })

}

mongoMonitor([{
  '$match' : {
    'operationType': 'update'
  }
}]);


app.use(express_session);


var corsOptions = {
  origin: 'http://localhost:3000',
  credentials : true,
   // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
//app.use(express.static('./frontend/build'));

app.get('/sessionhandler', async (req,res) => {
  console.log('Initial SESSION:')
  console.log(req.session);

  if( !(req.session.uuid) ){
    req.session.uuid = uuid.v4();
    console.log('session: '+req.session.uuid+' created @ /sessionhandler');
  } else {
    console.log('session UUID exists @ /sessionhandler')
  }
  req.push();
  res.send('{success: true}');
});

// create a GET route
app.get('/game/:roomId',async (req,res) =>{
  //Url Params:
  let roomId = req.params.roomId;

  //Search for roomId's matching the URL param in rooms collection:
  const roomData = await mongoDBsearch(['rooms',{_id: roomId}])
  console.log(`ROOM QUERY! ${roomData[0]}`)
  if( !((roomData).length) ){
    res.send({error: `room doesn't exist`});
  }
  //IF GUEST
  //
  else if ( !((await mongoDBsearch(['rooms',{_id: roomId,admin_session: req.session.uuid}])).length) ){
    console.log('Not an admin')
    if( !(roomData[0].guest_session)  ){
      //First time authentication of a guest, (f_irst t_ime a_uth (fta) is true, so is guest)
      res.send({valid: {guest:true, fta: true, gameBoard: roomData[0].game_board} }); 
      //Update room row
    } else {
      if(roomData[0].guest_session == req.session.uuid){
        console.log('Guest has re-joined');
        res.send({valid: {guest:true, fta: false, gameBoard: roomData[0].game_board}});
      } else {
        res.send({error: `You aren't authorized to join.`});
      }

    }

  //IF IS ADMIN
  //
  } else {
    console.log('/game/'+roomId+' result:')
    console.log(roomData[0].guest_session)
    //If the roomData has a guest_session that isn't '' (false)
    if(roomData[0].guest_session){
      res.send({valid: {guest:false,gameBoard:roomData[0].game_board} }); //Tell frontend that guest is here
    } else{
      res.send({valid: {guest:false} }); //Tell frontend that guest isn't here
    }
  }
});

app.get('/createroom', async (req,res) => {
  res.send();
});

app.get('/aboutus', (req, res) => { 
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); 
}); 


app.get('/menu', (req,res) => {
  console.log('Menu has been reached');
  res.send({express: 'test'})
});


app.get('/test', (req,res) => {
  console.log('test reached?')
  res.send({express: "TEST SUCCESS!"});
});

expressServer.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    });
  });