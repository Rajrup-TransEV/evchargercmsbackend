//cache operations
import Redis from "ioredis";
import logging from "../logging/logging_generate.js";
// Replace with your actual connection string
const redisconnuri = process.env.VALKEY
// Create a Redis client using the connection string
const redis = new Redis(redisconnuri)


// Function to flush all keys from Redis
const flushCache = async () => {
    try {
      // Flush all keys in the current database
      const result = await redis.flushall();
      console.log('Cache flushed successfully:', result);
    } catch (error) {
      console.error('Error flushing cache:', error);
    }
  };
  
  export default flushCache;