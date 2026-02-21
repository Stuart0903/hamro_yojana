import { Router } from "express";
import {userAuthenticate} from "../middlwares/user.authenticate.js";
import { createUserProfileController } from "../api/profile/profile.controller.js";
import { authenticateAdmin } from "../middlwares/verify.admin.js";
import { requireRoles } from "../middlwares/require.roles.js";


const router = Router();

router.get('/me',userAuthenticate, (req, res) => {
    res.json({ message: 'User profile endpoint' });
});

router.post('/create-userProfile', userAuthenticate, createUserProfileController );


router.post('/create-province-officer', 
    authenticateAdmin, 
    requireRoles("SUPER_ADMIN"), 
    (req, res) => {
        console.log("User roles:", req.user.roles);
      res.json({ message: 'Create province officer endpoint' });
     }
)
    

export default router;

