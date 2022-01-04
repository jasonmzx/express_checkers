const dbName = 'checker_db'; 



const Search = async (mongoClient, queryCollection, query) => {
    await mongoClient.connect();

    const db = mongoClient.db(dbName);
    //Search query:
    const collection = db.collection(queryCollection);

    // const query_result = await collection.find(query[1]).toArray();
    return await collection.find(query).toArray();
    
  }


const Insert = async (mongoClient, queryCollection, query) => {
    //Query structure: [ Collection name , Insert Query]
    await mongoClient.connect();

    const db = mongoClient.db(dbName);

    //Actual insert query:
    const collection = db.collection(queryCollection); 

    await collection.insertOne(query);

    return 200 //OK STATUS CODE 200
}

const Delete = async (mongoClient, queryCollection, query) => {
    //Query structure: [ Collection name , Delete Query]
    
    await mongoClient.connect();

    const db = mongoClient.db(dbName);
    
    const collection = db.collection(queryCollection);

    await collection.deleteOne(query);

    return 200 
}

  //queryCollection: Collection to update, 
  //filter: Which entries in collection to update 
  //update: What to actually change 
  //Options: Mongo params you can set
const Update = async (mongoClient, queryCollection, filter, update, options) => { 

    await mongoClient.connect();

    const db = mongoClient.db(dbName);

    const collection = db.collection(queryCollection);

    const result = await collection.updateOne(filter , update , options);

    return 200 //or result
}


    //Mongo DB Replica Monitor:
const Monitor = async (mongoClient, mongoRepClient, wsServer, pipeline) => {

    await mongoRepClient.connect();
    const collection = mongoRepClient.db('checker_db').collection('rooms');
    const changeStream = collection.watch(pipeline)

    changeStream.on('change', async(next) => {
    console.log(next);

        //If the guest_session property is updated: (Guest has authenticated):
    if(next.updateDescription.updatedFields.guest_session){
            //Find corresponding table:
        const findRoom = await Search(mongoClient,'rooms',{guest_session: next.updateDescription.updatedFields.guest_session})[0];
            

        for(const c of wsServer.clients ){

            if(c.sess_id == findRoom.admin_session){
                c.send(JSON.stringify( {guest_auth : true, game_board: findRoom.game_board} ));
            }
        }


    }

    if(next.updateDescription.updatedFields.game_board){

        const findRoom = await Search(mongoClient,'rooms',{_id: next.documentKey._id})[0];    
 

        for(const c of wsServer.clients){
        
            if(c.sess_id === findRoom[0].admin_session 
            || c.sess_id === findRoom[0].guest_session){

                //Send movement results to both users in game:
                c.send(JSON.stringify(
                {action_type: 'movementResult',
                perm: c.sess_id === findRoom.admin_session ? true : false,
                game_board: findRoom.game_board, 
                turn : findRoom.turn
            }
            ));
            }
        }


    }

    //useful debug stuff for this next api 
    //console.log(next.documentKey._id) //Room code (5 char randomized)
    //console.log(next.updateDescription.updatedFields.guest_session) //Guest Session Key

    }); //End of changeStream.on change



}


module.exports = {
    Search,
    Insert,
    Delete,
    Update,
    Monitor
}
