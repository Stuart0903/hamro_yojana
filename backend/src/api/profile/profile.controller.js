import { completeUserProfile } from "./profile.service.js";
import { prisma } from "../../config/db.config.js";
import { getLoggedInUserDetailsService, updateUserDetailsService } from "./profile.service.js";

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

export const getLoggedInUserDetailsController = async (req, res) => {
    try {
        const user = await getLoggedInUserDetailsService(req.user.userId);

        return res.status(200).json({
            message: "User details retrieved successfully",
            data: user,
         });  
    }catch(error){
        console.error('Error in getLoggedInUserDetailsController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        }
}

export const updateUserDetailsController = async (req, res) => {
    console.log("UserId", req.user.userId)
    console.log("Payload", req.body)
    try {
        const updatedUser = await updateUserDetailsService(req.user.userId, req.body);

        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
            data: updatedUser,
         });

    }catch(error){
        console.error('Error in updateUserDetailsController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

