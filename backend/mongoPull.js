const dbName = 'checker_db'; 



const Search = async (mongoClient, queryCollection, query) => {
    await mongoClient.connect();

    const db = mongoClient.db(dbName);
    //Search query:
    const collection = db.collection(queryCollection);

    // const query_result = await collection.find(query[1]).toArray();
    const res = await collection.find(query).toArray();

    return res[0];
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


 

module.exports = {
    Search,
    Insert,
    Delete,
    Update,

}
