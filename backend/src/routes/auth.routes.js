import { Router } from "express";
import { requestOTPController,
    verifyOTPController,
    createUserController,
    loginUserController,
    logoutUserController,
    refreshTokenController

 } from "../api/auth/auth.controller.js";
 import { userAuthenticate } from "../middlwares/user.authenticate.js";
 import { adminAuthController } from "../api/admin/auth/auth.controller.js";
 import { govAuthController } from "../api/auth/government/govAuth.controller.js";


const router = Router();

router.post('/user/request-otp', requestOTPController);

router.post('/user/verify-otp', verifyOTPController);

router.post('/user/register', createUserController);

router.post('/user/login', loginUserController);

router.post('/user/refresh-token', refreshTokenController );

router.post('/user/logout', userAuthenticate,logoutUserController);


router.post('/admin/login', adminAuthController); 

router.post('/officer/login', govAuthController);





export default router;