//Imports:
const mongoPull = require('./mongoPull.js')
const gameFunction = require('./gameFunction.js')

const OnMessage = async (parsedData,ws_request,mongoClient) => {
        //ParsedData sent back:
    
        switch(parsedData.query_type) {
          case 'create_room':
            //Delete any previous rooms created by Host user: (admin user)
            mongoPull.Delete(mongoClient,'rooms', {admin_session: ws_request.session.uuid});
    
            // DB ENTRY Structure:
            const insertData =  {                                   
              _id : gameFunction.IdGenerator(), //Insert Data into Collection [0]
              room_name : parsedData.room_name,
              admin_session: ws_request.session.uuid,
              guest_session : '',
              game_board: '0202020220202020020202020000000000000000101010100101010110101010'.split('').map(Number), //8 x 8 Checkers grid (1D array), 0 = Empty spot, 1 = red, 2 = black
              turn: null, //null: Game isn't authed , false: Guest's turn , true: Admin's turn
              last_time: null,
              turn_time : parseInt(parsedData.time_input)
      
            }
            console.log(insertData)
    
            await mongoPull.Insert(mongoClient , 'rooms', insertData);
          
            return JSON.stringify({'room_url': insertData._id}) 

          case 'guest_fta':
            //Guest's First Time Authentication:
            
            const findRoom = await mongoPull.Search(mongoClient,'rooms',{_id: parsedData.room_id}); //This obj is wrapped in an array, please reference findRoom as findRoom[0]
            console.log(findRoom) // Debug
              if(findRoom != undefined){
              await mongoPull.Update(mongoClient,'rooms',{_id : findRoom._id }, { $set : { guest_session : ws_request.session.uuid , turn : true , last_time: Date.now()} }, {upsert: false});
              }
            return 
            break;

          case 'movement':
    
            const pawnType = {
              admin: [1 , -1],
              guest: [2, -2]
            }
    
            //When either user moves:
            const selectedRoom = await mongoPull.Search(mongoClient,'rooms',{_id : parsedData.room_id} );
            let parsedBoard = selectedRoom.game_board;
    
    
            let movementValid = async () => {
              const boardValidation = gameFunction.checkBoard(parsedBoard,parsedData.movement.old);
    
              const newBoard = gameFunction.Converter(
                parsedBoard, 
                boardValidation,
                parsedData.movement.old,
                parsedData.movement.new
              );
                
              await mongoPull.Update(
                mongoClient,
                'rooms',
                {_id : selectedRoom._id},
                {$set : {game_board : newBoard, turn : !selectedRoom.turn, last_time: Date.now() } }, {upsert: false}
              );
    
            }
    
    
            const maxTime = selectedRoom.last_time + 1000*selectedRoom.turn_time
    
            if(ws_request.session.uuid === selectedRoom.admin_session 
              && selectedRoom.turn 
              && pawnType.admin.includes(selectedRoom.game_board[parsedData.movement.old])  
              && maxTime >= Date.now()
            ){  //Admin
            console.log('VALIDATED ADMIN TURN');
            movementValid();
    
            } else if(ws_request.session.uuid === selectedRoom.guest_session 
                    && !selectedRoom.turn
                    && pawnType.guest.includes(selectedRoom.game_board[parsedData.movement.old]) 
                    && maxTime >= Date.now()
            ){ //Guest
            console.log('VALIDATED GUEST TURN');
            movementValid();
            
    
    
            } else {
              return
    
    
            }
    
    
    
            //console.log("Movement Detected: "+selectedRoom[0].turn);
    
            break;
            
            case 't0':

              const t0room = await mongoPull.Search(mongoClient,'rooms',{_id : parsedData.room_id} );


              if(t0room && t0room.admin_session === ws_request.session.uuid && t0room.turn){ //Admin times up

                await mongoPull.Update(
                  mongoClient, 
                  'rooms',
                  {_id : t0room._id},
                  {$set : {turn : !t0room.turn, last_time: Date.now() } }, 
                  {upsert: false}
                  );

              } else if(t0room && t0room.guest_session === ws_request.session.uuid && !t0room.turn ){ //Guest times up

                await mongoPull.Update(
                  mongoClient, 
                  'rooms',
                  {_id : t0room._id},
                  {$set : {turn : !t0room.turn, last_time: Date.now() } }, 
                  {upsert: false}
                  );


              }



              break;
        }
    

}

module.exports = {
  OnMessage
}