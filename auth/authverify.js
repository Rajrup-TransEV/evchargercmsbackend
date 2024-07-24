import cookie from "cookie"
import jwt from "jsonwebtoken"

export const verifyuser=async(req,res)=>{
    const apiauthkey = req.headers['apiauthkey'];
    // Check if the API key is valid
    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
      return res.status(403).json({ message: "API route access forbidden" });
  }
    const cookies = cookie.parse(req.headers.cookie || '');

    // Check if cookies are present
    if (!cookies || !cookies.token || !cookies.refresh_token) {
        return res.status(401).json({ message: 'Unauthorized user' });
    }

    const { token, refresh_token } = cookies;

    try {
        // Verify the JWT token
        if (token) {
            const user = jwt.verify(token, SECRET_KEY);
            return res.status(200).json({
                message: 'Token verified successfully',
                user: user // Send user information back
            });
        } else {
            return res.status(403).json({ message: 'No JWT token value has been provided' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}