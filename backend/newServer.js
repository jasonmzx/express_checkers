//NPM Libs & Dependencies:

const express = require('express');
const session = require('express-session'); //express sessions
const ws = require('ws'); 
const uuid = require('uuid');
const cors = require('cors');

//Importing other backend files & functionality:

const mongo = require('./mongoDatabase.js'); // Mongo DB database pool (regular & replica servers)
const mongoPull = require('./mongoPull.js'); //Mongo DB Querying functionality (mongoPull.Search to search a collection for ex.)
const socketHandler = require('./socketHandler.js'); //Handles the switch statement for incoming WS queries ** ERROR HANDLE THIS WELL !
const getHandler = require('./getHandler.js');
const gameFunction = require('./gameFunction.js'); //All main game functionality (checkers algorithm, converter algorithm, id generator)

const app = express(); //express app

const port = process.env.PORT || 5000; 


const mongoClient = mongo.client;
const mongoRepClient = mongo.client_replica;


// This displays message that the server running and listening to specified port
const expressServer = app.listen(port, () => console.log(`Listening on port ${port}`));

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
    
    socket.send(await socketHandler.OnMessage(parsedData,ws_request,mongoClient) );


  });
});

//The mongoMonitor function can't properly load the wsServer in mongoPull, so I left it in the main server.js file
//mongoMonitor is the function that is triggered when any objects have an OperationType of update done

const mongoMonitor = async (pipeline) => {
  await mongoRepClient.connect();
  const collection = mongoRepClient.db('checker_db').collection('rooms');
  const changeStream = collection.watch(pipeline)

  changeStream.on('change', async (next) => {
    console.log(next);

    //If the guest_session property is updated: (Guest has authenticated):
    if(next.updateDescription.updatedFields.guest_session){
      //Find corresponding table:
      const findRoom = await mongoPull.Search(mongoClient,'rooms',{guest_session: next.updateDescription.updatedFields.guest_session});
      console.log(findRoom)

      for(const c of wsServer.clients ){
        if(c.sess_id == findRoom.admin_session){
          c.send(JSON.stringify({action_type: 'guestFta',guest_auth : true, game_board: findRoom.game_board, turn_time: findRoom.turn_time, last_time: findRoom.last_time}))
        }
      }


    }

    //If a movement is made, update both players game
    if(next.updateDescription.updatedFields.game_board || next.updateDescription.updatedFields.last_time ){

      const findRoom = await mongoPull.Search(mongoClient,'rooms',{_id: next.documentKey._id});
      console.log(findRoom)

      for(const c of wsServer.clients){
        
        if(c.sess_id === findRoom.admin_session || c.sess_id === findRoom.guest_session){
          c.send(JSON.stringify({
            action_type: 'movementResult',
            perm: c.sess_id === findRoom.admin_session ? true : false,
            game_board: findRoom.game_board, 
            turn : findRoom.turn, 
            turn_time: findRoom.turn_time, 
            last_time: findRoom.last_time
          }));

        }
      }


    }


    //console.log(next.documentKey._id) //Room code (5 char randomized)
    //console.log(next.updateDescription.updatedFields.guest_session) //Guest Session Key

  })

}
//mongoClient,mongoRepClient,wsServer
mongoMonitor([{
  '$match' : {
    'operationType': 'update'
  }
}]);


//EXPRESS MIDDLEWARE:

      //Express Session MW:
    const express_session = session({
      secret: 'secret-key',
      resave: false,
      saveUninitialized: false
    });

    app.use(express_session);

      //CORS for Browsers (HTTP Middleware)
    const corsOptions = {
      origin: 'http://localhost:3000',
      credentials : true,
      // some legacy browsers (IE11, various SmartTVs) choke on 204
    }

    app.use(cors(corsOptions));


//EXPRESS GET PATHS:

    //SESSIONHANDLER - Attaches .uuid param to incoming requests' sessions.
    app.get('/sessionhandler', async (req,res) => {

      res.send( await getHandler.sessionGetter(req) );

    });

    //GAME/ROOMID - All HTTP Authentication for requests & games (Authorization, FTA, IsGuest, IsAdmin, etc...)
    app.get('/game/:roomId',async (req,res) =>{

      const roomId = req.params.roomId;
      res.send( await getHandler.gameRoomGetter(mongoClient,req,roomId) );

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



expressServer.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    });
  });