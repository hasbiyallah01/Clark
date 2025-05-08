import User from "../Models/User";

const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

const AuthMiddleware ={
    verifyToken: (req: any, res: any, next: any) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
          return res.status(401).json({ message: 'Unauthorized access.' });
        }
      
        jwt.verify(token, SECRET_KEY, async (err: any, decoded: any) => {
          if (err) {
            return res.status(401).json({ message: 'Unauthorized access.' });
          }
          req.user = decoded;
      
          const email = decoded?.email;
          if (!email) {
              return res.status(401).json({ success: false, error: "Unauthorized access." });
          }
      
          const user = await User.findOne({ where: { email } });
          if (!user) {
              return res.status(401).json({ success: false, error: "Unauthorized access." });
          }
      
          next();
        });
      }
}
export default AuthMiddleware;