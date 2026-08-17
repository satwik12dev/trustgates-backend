require("dotenv").config();

const redis = require("./src/config/redis");


(async()=>{

    try {

        // redis.js already auto connect karta hai
        await redis.flushDb();

        console.log("Redis Cleared ✅");

        process.exit(0);

    }
    catch(error){

        console.error(error);

        process.exit(1);

    }

})();