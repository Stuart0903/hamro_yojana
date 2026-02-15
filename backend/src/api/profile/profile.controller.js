import { completeUserProfile } from "./profile.service.js";

export const createUserProfileController = async (req, res) => {
    try {
        const userId = req.user.userId
        console.log(userId)
        const result = await completeUserProfile(userId, req.body);
        res.json({ message: 'User profile created successfully', data: result });
    }catch(error){
        console.error('Error in createUserProfile controller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}