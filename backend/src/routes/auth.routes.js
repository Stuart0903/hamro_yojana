import { Router } from "express";
import { requestOTPController,
    verifyOTPController,
    createUserController,
    loginUserController,
    logoutUserController

 } from "../api/auth/auth.controller.js";

const router = Router();

router.post('/user/request-otp', requestOTPController);

router.post('/user/verify-otp', verifyOTPController);

router.post('/user/register', createUserController);

router.post('/user/login', loginUserController);

router.post('/user/logout', logoutUserController);



export default router;