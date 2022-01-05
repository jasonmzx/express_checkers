const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const url_replica = 'mongodb://localhost:27099';
const client_replica = new MongoClient(url_replica);

module.exports = {
    client , client_replica
}