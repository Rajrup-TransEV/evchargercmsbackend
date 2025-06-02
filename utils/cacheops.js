//cache operations
import Redis from "ioredis";
import logging from "../logging/logging_generate.js";
// Replace with your actual connection string
const redisconnuri = process.env.VALKEY
// Create a Redis client using the connection string
const redis = new Redis(redisconnuri)

/**
 * Set a value in Redis cache
 * @param {string} key - The key under which the value will be stored
 * @param {any} value - The value to be stored (will be stringified)
 * @param {number} [expiration] - Optional expiration time in seconds
 */
export const setCache = async(key,value,expiration)=>{
    try {
        await redis.set(key,JSON.stringify(value),'EX',expiration)
        console.log(`Cache set for key: ${key}`)
        const messagetype = "success"
        const message =`Data set to cache ${JSON.stringify(value)}`
        const filelocation = "cacheops.js";
        logging(messagetype,message,filelocation)
    } catch (error) {
        const messagetype = "error"
        const message =`Error setting cache for key: ${key},${error}`
        const filelocation = "cacheops.js";
        logging(messagetype,message,filelocation)
        console.log(`Error setting cache for key: ${key}`,error)
    }
}


/**
 * Get a value from Redis cache
 * @param {string} key - The key to retrieve the value
 * @returns {Promise<any>} - The parsed value from cache or null if not found
 */
export const getCache = async(key)=>{
    try {
        const cachedValue = await redis.get(key);
        if (cachedValue) {
            const messagetype = "success"
            const message =`Cache hit for key: ${key}`
            const filelocation = "cacheops.js";
            logging(messagetype,message,filelocation)
            console.log(`Cache hit for key: ${key}`);
            return JSON.parse(cachedValue);
            
        } else {
            const messagetype = "error"
            const message =`Cache miss for key: ${key}`
            const filelocation = "cacheops.js";
            logging(messagetype,message,filelocation)
            console.log(`Cache miss for key: ${key}`);
            return null;
        }
    } catch (error) {
        const messagetype = "error"
        const message =`Error getting cache for key: ${key}, ${error}`
        const filelocation = "cacheops.js";
        logging(messagetype,message,filelocation)
        console.log(`Error getting cache for key: ${key}`, error);
        return null;
    }

}
/**
 * Close the Redis connection
 */
export const closeRedisConnection = async () => {
    await redis.quit();
    console.log("Redis connection closed");
}