const express = require('express');
const ws = require('ws'); 
const app = express(); //express app
const session = require('express-session'); //express sessions
const uuid = require('uuid');
const port = process.env.PORT || 5000; 
const mongo = require('./mongoDatabase.js')
const mongoClient = mongo.client


// This displays message that the server running and listening to specified port
const expressServer = app.listen(port, () => console.log(`Listening on port ${port}`));

//Session stuff:
const express_session = session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
  });

const mongoDBsearch = async (query) => {
  await mongoClient.connect();
  const db = mongoClient.db('checker_db');
  //Search query:
  const collection = db.collection(query[0]);
  const query_result = await collection.find(query[1]).toArray();
  return query_result
  
}


const mongoDBinsert = async (data) => {
    await mongoClient.connect();
    const db = mongoClient.db('checker_db');
    //Actual insert query:
    const collection = db.collection(data[0]);
    await collection.insertOne(data[1]);
    return 'Db successed!'
}


const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket,ws_request) => {
    console.log('WS connected');
    express_session(ws_request, {}, () => {
      console.log('WS SESSION: '+ws_request.session.uuid)

    });


    //Set persons socket session_id to Random UUID
    socket.sess_id = uuid.v4();


  socket.on('message', async (data) => {
    // socket.send(await mongotest(message)); 
    const parsedData = JSON.parse(data.toString());
    if(parsedData.query_type === 'create_room'){
      mongoDBinsert(
        [ 'rooms', //Collection Name 
        {                                   
          _id : parsedData.room_id, //Insert Data into Collection [0]
          room_name : parsedData.room_name,
          room_admin: ws_request.session.uuid,
          room_guest : ''
        }
        ]
      )

      console.log('This request is to create a room.')

    }



    //console.log(socket.sess_id); 
    console.log(parsedData); 
  });
});


app.use(express_session);

app.get('/sessionhandler', async (req,res) => {
  if( !(req.session.uuid) ){
    req.session.uuid = uuid.v4();
    console.log('session: '+req.session.uuid+' created @ /sessionhandler');
  } else {
    console.log('session UUID exists @ /sessionhandler')
  }
  res.send();
});

// create a GET route
app.get('/game/:roomId',async (req,res) =>{
  //Url Params:
  let roomId = req.params.roomId;

  //Check if roomId exists:

  //Search for roomId's matching the URL param in rooms collection:
  const roomData = await mongoDBsearch(['rooms',{_id: roomId}])

  if( !((roomData).length) ){
    console.log('room dont exist')
    res.send({error: `room doesn't exist`});
  }
  //Check if user is admin on existing room:
  else if ( !((await mongoDBsearch(['rooms',{_id: roomId,room_admin: req.session.uuid}])).length) ){
    console.log('Not an admin')
    if( !(roomData.room_guest)  ){
      res.send({valid: 'This room is joinable'});
    } else {
      res.send({error: `You aren't authorized to join.`})
    }
  } else {
  console.log('/game/'+roomId+' result:')
  res.send({valid: 'Welcome, '+req.session.uuid+' , to room '+roomId+'!'});
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