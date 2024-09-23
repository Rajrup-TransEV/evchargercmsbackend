const ipTracker = (req, res, next) => {
    // Get the user's IP address from different sources
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.socket.remoteAddress || 
                      req.connection.remoteAddress || 
                      '';
  
    // If there are multiple IPs in 'x-forwarded-for', take the first one
    const userIp = ipAddress.split(',')[0].trim();
  
    // Check if the IP address is an IPv4 address
    const isIPv4 = (ip) => {
      const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipv4Pattern.test(ip);
    };
  
    // Log or store the IP address if it's IPv4
    if (isIPv4(userIp)) {
      console.log(`User IPv4 Address: ${userIp}`);
      // Attach the IPv4 address to the request object for later use
      req.userIp = userIp;
    } else {
      console.log(`Non-IPv4 Address Detected: ${userIp}`);
    }
  
    // Call next middleware or route handler
    next();
  };
  
  export default ipTracker;
  