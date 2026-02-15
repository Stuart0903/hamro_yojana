
import {prisma} from '../config/prisma.js';

export const checkProfileStatus = async (req, res, next) => {
    try {
        const userId = req.user && (req.user.uid || req.user.userId);
        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.profileCompleted) {
            return res.status(403).json({ message: 'Profile not completed' });
        }
        next();

    }catch(error){
        console.error('Error in profile status middleware:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}