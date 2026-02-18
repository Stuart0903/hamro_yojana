import { Router } from "express";
import { requestOTPController,
    verifyOTPController,
    createUserController,
    loginUserController,
    logoutUserController,
    refreshTokenController

 } from "../api/auth/auth.controller.js";
 import { userAuthenticate } from "../middlwares/user.authenticate.js";


const router = Router();

router.post('/user/request-otp', requestOTPController);

router.post('/user/verify-otp', verifyOTPController);

router.post('/user/register', createUserController);

router.post('/user/login', loginUserController);

router.post('/user/refresh-token', refreshTokenController );

router.post('/user/logout', userAuthenticate,logoutUserController);




export default router;