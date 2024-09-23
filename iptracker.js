import { PrismaClient } from '@prisma/client';
import requestIp from 'request-ip';

const prisma = new PrismaClient();

const ipTracker = async (req, res,next) => {
const ip = requestIp.getClientIp(req)

  console.log("Your ip is ",ip);
  
  // Send response with the IP
  res.json({ data: ip });
  next()
};

export default ipTracker;
