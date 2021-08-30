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



const mongoDB = async (data) => {
    await mongoClient.connect();
    const db = mongoClient.db('checker_db');
    const collection = db.collection(data[0]);
    await collection.insertOne(data[1]);
    return 'Db successed!'
}


const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket,ws_request) => {
    console.log('WS connected');
    express_session(ws_request, {}, () => {
      console.log(ws_request.sessionID);
    });


    //Set persons socket session_id to Random UUID
    socket.sess_id = uuid.v4();


  socket.on('message', async (data) => {
    // socket.send(await mongotest(message)); 
    const parsedData = JSON.parse(data.toString());
    if(parsedData.query_type === 'create_room'){
      mongoDB(
        [ 'rooms', //Collection Name 
        {                                   
          _id : parsedData.room_id, //Insert Data into Collection [0]
          room_name : parsedData.room_name,
          room_admin: socket.sess_id,
          room_guest : ''
        }
        ]
      )

      console.log('This request is to create a room.')

    }



    console.log(socket.sess_id); 
    console.log(parsedData); 
  });
});


app.use(express_session);

// create a GET route


app.get('/aboutUs', (req, res) => { 
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); 
}); 

app.get('/menu', (req,res) => {
  console.log(req.sessionID);
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