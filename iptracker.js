import { PrismaClient } from '@prisma/client';
import generateCustomRandomUID from './lib/customuids.js';

const prisma = new PrismaClient();

const ipTracker = async (req, res, next) => {
  try {
    // Get the user's IP address from different sources
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.socket.remoteAddress || 
                      req.connection.remoteAddress || 
                      '';

    // If there are multiple IPs in 'x-forwarded-for', take the first one
    const userIp = ipAddress.split(',')[0].trim();

    // Separate IPv4 and IPv6 addresses
    const isIPv4 = (ip) => {
      const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipv4Pattern.test(ip);
    };

    const isIPv6 = (ip) => {
      const ipv6Pattern = /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[^\s]+|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}|([0-9a-fA-F]{1,4}:){1,5}:((25[0-5]|(2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}))|([0-9a-fA-F]{1,4}:){7}:|([0-9a-fA-F]{1,4}:){6}:([0-9a-fA-F]{1,4}|:)|([0-9a-fA-F]{1,4}:){5}(:([0-9a-fA-F]{1,4}|:)){2}/;
      return ipv6Pattern.test(ip);
    };

    let ipv4Address = null;
    let ipv6Address = null;

    if (isIPv4(userIp)) {
      ipv4Address = userIp;
    } else if (isIPv6(userIp)) {
      ipv6Address = userIp;
    }

    // Save the IP addresses to the database
    await prisma.iptracker.create({
      data: {
        uid: generateCustomRandomUID(), // Ensure this function generates a unique ID
        ipv4addess: ipv4Address || null,
        ipv6address: ipv6Address || null,
        originoftheip: req.headers['origin'] || 'unknown', // You can customize this as needed
      },
    });

    // Log the IP addresses
    if (ipv4Address) {
      console.log(`User IPv4 Address: ${ipv4Address}`);
    }
    
    if (ipv6Address) {
      console.log(`User IPv6 Address: ${ipv6Address}`);
    }

    // Attach the IP addresses to the request object for later use
    req.userIp = { ipv4: ipv4Address, ipv6: ipv6Address };

    // Call next middleware or route handler
    next();
  } catch (error) {
    console.error('Error saving IP address:', error);
    next(error); // Pass error to the next middleware
  }
};

export default ipTracker;
