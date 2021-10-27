const express = require('express');
const ws = require('ws'); 
const app = express(); //express app
const session = require('express-session'); //express sessions
const uuid = require('uuid');
const port = process.env.PORT || 5000; 
const mongo = require('./mongoDatabase.js')
const mongoClient = mongo.client
const mongoRepClient = mongo.client_replica


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
      console.log('WS SESSION: '+ws_request.session.uuid)
      socket.sess_id = ws_request.session.uuid

    });

  socket.on('message', async (data) => {
    //ParsedData sent back:
    const parsedData = JSON.parse(data.toString());

    //Create Room:
    if(parsedData.query_type === 'create_room'){
      mongoDBremove(['rooms', {admin_session: ws_request.session.uuid}]);

      //Database Entry Structure:
      const insertData =  {                                   
        _id : id_generator(), //Insert Data into Collection [0]
        room_name : parsedData.room_name,
        admin_session: ws_request.session.uuid,
        guest_session : '',
        game_board: '0202020220202020020202020000000000000000101010100101010110101010'.split('') //8 x 8 Checkers grid (1D array), 0 = Empty spot, 1 = red, 2 = black
      }

      await mongoDBinsert([ 'rooms', insertData]);
      
      console.log(insertData);
      socket.send(JSON.stringify({'room_url': insertData._id}) );
      socket.close();
      console.log('This request is to create a room.')
    
    //Guest first time authentication:
    } else if(parsedData.query_type === 'guest_fta'){
      const findRoom = await mongoDBsearch(['rooms',{_id: parsedData.room_id}]); //This obj is wrapped in an array, please reference findRoom as findRoom[0]
      console.log('GUEST has authenticated')
      await mongoDBupdate('rooms',{_id : findRoom[0]._id }, { $set : { guest_session : ws_request.session.uuid } }, {upsert: false})

      console.log(findRoom);
      socket.send('yup!');

      console.log(wsServer.clients.size);

    }



    console.log(socket.sess_id); 
    console.log(parsedData); 
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
      const findRoom = await mongoDBsearch(['rooms',{guest_session: next.updateDescription.updatedFields.guest_session }]);
      console.log(findRoom)

      for(const c of wsServer.clients ){
        if(c.sess_id == findRoom[0].admin_session){
          c.send(JSON.stringify({guest_auth : true, game_board: findRoom[0].game_board}))
        }
      }


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

app.get('/sessionhandler', async (req,res) => {
  if( !(req.session.uuid) ){
    req.session.uuid = uuid.v4();
    console.log('session: '+req.session.uuid+' created @ /sessionhandler');
    console.log('URL: '+req.query.valid)
  } else {
    console.log('session UUID exists @ /sessionhandler')
  }
  res.send();
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