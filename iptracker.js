import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ipTracker = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(ip)
  res.json({ data:ip });
};

export default ipTracker;
