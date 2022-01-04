//Imports:
const mongoPull = require('./mongoPull.js')
const gameFunction = require('./gameFunction.js')

//This file will process the parsedData sent to the backend.

const OnMessage = async (socketQuery,wsRequest,mongoClient) => {

    switch(socketQuery.query_type) {

        case 'create_room':
            
            //Delete any previous rooms created by Host User (admin_session user):
            await mongoPull.Delete(mongoClient, 'rooms', {admin_session: ws_request.session.uuid});

            //DB Createroom Entry: (Inserts into 'rooms' collection):
            const createRoomData = {
                _id : gameFunction.IdGenerator(),
                room_name : socketQuery.room_name,
                admin_session : wsRequest.session.uuid,
                guest_session : '',
                game_board : '0202020220202020020202020000000000000000101010100101010110101010'.split('').map(Number), //8 x 8 Checkers grid (1D array), 0 = Empty spot, 1 = red, 2 = black
                turn: null 
                //turnTimer ....implement later
            }

            await mongoPull.Insert(mongoClient, 'rooms', createRoomData);

            return JSON.stringify({'room_url' : createRoomData._id});

        case 'guest_fta':

            const findRoom = await mongoPull.Search(mongoClient, 'rooms', {_id : socketQuery.room_id})[0];
            
            if( typeof findRoom === Object ){
                const queryStatus = await mongoPull.Update(
                    mongoClient, 
                    'rooms', //collection
                    {_id : findRoom._id}, //filter
                    { $set : { guest_session : ws_request.session.uuid , turn : true } }, //update
                    {upsert: false} //options
                );
                return JSON.stringify({'status': queryStatus});
            }
        
        case 'movement':

            const pawnType = { admin: [1, -1] , guest: [2, -2]}

            const findRoom = await mongoPull.Search(mongoClient,'rooms',{_id : parsedData.room_id} )[0];
            const parsedBoard = findRoom.game_board;

            let movementValid = async () => {
                const boardValidation = gameFunction.checkBoard(parsedBoard,socketQuery.movement.old);
                
                const newBoard = gameFunction.Converter(
                  parsedBoard, 
                  boardValidation,
                  socketQuery.movement.old,
                  socketQuery.movement.new
                );
                    
                await mongoPull.Update(
                    mongoClient, 
                    'rooms', //collection
                    {_id : findRoom._id}, //filter
                    { $set : { game_board : newBoard , turn : !findRoom.turn } }, //update
                    {upsert: false} //options
                );


            }

            if(wsRequest.session.uuid === findRoom.admin_session
              && findRoom.turn
              && pawnType.admin.includes(findRoom.game_board[socketQuery.movement.old])
            ){ //If admin
               console.log('[@socket.onMessage -> movement] : validated ADMIN turn.');
               movementValid(); 
               return 
            }

            else if(wsRequest.session.uuid === findRoom.guest_session
                && !findRoom.turn
                && pawnType.guest.includes(findRoom.game_board[socketQuery.movement.old])
            ){ //If guest
                console.log('[@socket.onMessage -> movement] : validated GUEST turn.');
                movementValid(); 
                return
            }

            else {
                return
            }


    }


}