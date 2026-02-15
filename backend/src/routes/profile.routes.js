import { Router } from "express";
import {userAuthenticate} from "../middlwares/user.authenticate.js";
import { createUserProfileController } from "../api/profile/profile.controller.js";


const router = Router();

router.get('/me',userAuthenticate, (req, res) => {
    res.json({ message: 'User profile endpoint' });
});

router.post('/create-userProfile', userAuthenticate, createUserProfileController );
    

export default router;

