const express = require('express');
const ws = require('ws'); 
const app = express(); 
const port = process.env.PORT || 5000; 
const mongo = require('./mongoDatabase.js')
const mongoClient = mongo.client


// This displays message that the server running and listening to specified port
const expressServer = app.listen(port, () => console.log(`Listening on port ${port}`));

const mongotest = async (message) => {
    await mongoClient.connect();
    const db = mongoClient.db('checker_db');
    const collection = db.collection('rooms');
    await collection.insertOne({ msg: message.toString() });
    return 'Db successed!'
}


const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
    //Inital Websocket setup (Creation Session ID)
    console.log('WS connected');
    socket.sess_id = 'blah';
  socket.on('message', async (message) => {
    socket.send(await mongotest(message));  
    console.log(message.toString()); } );
});

// create a GET route
app.get('/express_backend', (req, res) => { 
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); 
}); 

expressServer.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    });
  });