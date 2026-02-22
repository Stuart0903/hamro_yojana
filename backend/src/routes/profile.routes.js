import { Router } from "express";
import {userAuthenticate} from "../middlwares/user.authenticate.js";
import { createUserProfileController } from "../api/profile/profile.controller.js";
import { authenticateAdmin } from "../middlwares/verify.admin.js";
import { requireRoles } from "../middlwares/require.roles.js";
import { getLoggedInUserDetailsController, updateUserDetailsController } from "../api/profile/profile.controller.js";


const router = Router();

router.get('/me',userAuthenticate, getLoggedInUserDetailsController);

router.post('/create-userProfile', userAuthenticate, createUserProfileController );


router.post('/create-province-officer', 
    authenticateAdmin, 
    requireRoles("SUPER_ADMIN"), 
    (req, res) => {
        console.log("User roles:", req.user.roles);
      res.json({ message: 'Create province officer endpoint' });
     }
)

router.put('/update-user-details', userAuthenticate, updateUserDetailsController);
// router.patch('/update-user-details', userAuthenticate, updateUserDetailsController);
    

export default router;

