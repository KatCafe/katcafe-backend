const redis = require("redis");
const bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client =  redis.createClient(constsSecret.redis.host.port, constsSecret.redis.host.address);

import consts from "consts/consts"
import constsSecret from "consts/consts-secret"

async function conenctDB (){

    if (constsSecret.redis.db) await client.select(constsSecret.redis.db);

    if (constsSecret.redis.pswd) await client.auth(constsSecret.redis.pswd);

    client.on("connect", function (err) {
        console.info("Redis connected");
    });

    client.on("error", function (err) {
        console.log("Error " + err);
    });

}

client.conenctDB = conenctDB;

export default client;


