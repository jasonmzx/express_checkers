//NPM Libs & Dependencies:

const express = require('express');
const session = require('express-session'); //express sessions
const ws = require('ws'); 
const cors = require('cors');
const uuid = require('uuid');

//Import files:

const mongo = require('./mongoDatabase.js');
const mongoPull = require('./mongoPull.js');
const socketHandler = require('./socketHandler.js');

//Mongo DB setup:
const mongoClient = mongo.client;
const mongoRepClient = mongo.client_replica;

//Express setup:
const app = express(); 
const port = 5000;

//Run Express server on port
const expressServer = app.listen(port, () => console.log(`Listening on port ${port}`));


//WS SERVER:

const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', (socket,ws_request) => {
    console.log('WS connected');
    //Instance of session, add property to socket:
    express_session(ws_request, {}, () => {
      socket.sess_id = ws_request.session.uuid

      //debug
      console.log('WS SESSION: '+ws_request.session.uuid)
      console.log('# WS Clients: ' + wsServer.clients.size.toString())


    });
  
  //Incoming Requests
  socket.on('message', async (data) => {
    //ParsedData sent back:
    const parsedData = JSON.parse(data.toString());
    console.log(parsedData);

    socket.send( await socketHandler.OnMessage(parsedData, ws_request, mongoClient) );
    
    //debug
    console.log(socket.sess_id); 
    console.log(parsedData); 
  });
});

//Mongo Replica monitor:
mongoPull.Monitor(mongoClient,mongoRepClient,wsServer,[{
  '$match' : {
    'operationType': 'update'
  }
}]);




//Express Middleware:
const express_session = session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
});

app.use(express_session);

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials : true,
   // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

//Express 

app.get('/sessionhandler', async (req,res) => {
  //console.log(await mongoPull.Search(mongoClient,'rooms',{_id : 'XmbJP'} ));

  if( !(req.session.uuid) ){
    req.session.uuid = uuid.v4();
    console.log('[/sessionhandler] '+req.session.uuid+' created.');
  } else {
    console.log('session UUID exists @ /sessionhandler')
  }
  // req.push();
  res.send('{success: true}');
});

// create a GET route
app.get('/game/:roomId',async (req,res) =>{
  //Url Params:
  const roomId = req.params.roomId;

  //Search for roomId's matching the URL param in rooms collection:
  const roomData = await mongoPull.Search(mongoClient,'rooms',{_id: roomId});
  console.log(`ROOM QUERY! ${roomData[0]}`)
  if( !((roomData).length) ){
    res.send({error: `room doesn't exist`});
  }
  //IF GUEST
  //
  else if ( !((await mongoPull.Search(mongoClient,'rooms',{_id: roomId,admin_session: req.session.uuid})).length) ){
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

//Express server WS upgrade handling
expressServer.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});