@echo off
cd C:\Program Files\MongoDB\Server\5.0\bin
:: Primary Mongo Server ( Port : 27017 )
start mongod --dbpath "C:\Program Files\MongoDB\Server\5.0\data" --logpath "C:\Program Files\MongoDB\Server\5.0\log\mongod.log" --port 27017 --storageEngine=wiredTiger --journal --replSet checkers_db_replica
:: Primary Mongo Server ( Port : 27099 )
start mongod --dbpath "C:\mongodb_rep\db" --logpath "C:\mongodb_rep\log\mongod.log" --port 27099 --storageEngine=wiredTiger --journal --replSet checkers_db_replica
