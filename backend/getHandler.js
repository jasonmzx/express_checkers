const res = require('express/lib/response');
const mongoPull = require('./mongoPull.js');
const uuid = require('uuid');

const sessionGetter = async(req) => {
    console.log('Initial SESSION:')
    console.log(req.session);
  
    if( !(req.session.uuid) ){
      req.session.uuid = uuid.v4();
      console.log('session: '+req.session.uuid+' created @ /sessionhandler');
    } else {
      console.log('session UUID exists @ /sessionhandler')
    }
    return {success: true};

}

const gameRoomGetter = async (mongoClient, req, roomID) => {

    const roomData = await mongoPull.Search(mongoClient, 'rooms', {_id: roomID});
    console.log(roomData);

    if(!roomData){
        return {error : `Room doesn't exist.`}
    }

    if(roomData.admin_session !== req.session.uuid){ //Is Guest
        
        if(!roomData.guest_session){ //Guest's first time authenticating.
            return {valid: 
                {guest: true, 
                fta: true, 
                gameBoard: roomData.game_board}
            }
        } 

        if(roomData.guest_session === req.session.uuid){ //Guest Rejoining after Disconnect or Refresh
            return {valid: 
                {guest: true, 
                fta: false, 
                gameBoard: roomData.game_board}
            }    
        }

        return {error : `You aren't authorized to join this game.`}

    }

    if(roomData.admin_session === req.session.uuid){ //Is Admin

        if(!roomData.guest_session){ //If the guest hasn't authenticated for the first time yet;
            return {valid: {guest: false} }

        } else {
            return {valid: {guest:false,gameBoard:roomData.game_board} }

        }    

    }

}


module.exports = {
    sessionGetter,
    gameRoomGetter
}