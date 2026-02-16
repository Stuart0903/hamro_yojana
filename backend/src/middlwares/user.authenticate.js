import jwt from 'jsonwebtoken';
export const userAuthenticate = (req, res, next) => {

    try{
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log('Decoded token:', req.user.userId);
        next();

    }catch(error){
        console.error('Error in user authentication middleware:', error);
        
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({ 
                message: 'Token expired', 
                expiredAt: error.expiredAt 
            });
        }
        
        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({ 
                message: 'Invalid token' 
            });
        }
        
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
