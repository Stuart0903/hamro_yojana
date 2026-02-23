import { Router } from "express";
import { requestRegisterOTPController,
    verifyRegisterOTPController,
    createUserController,
    loginUserController,
    logoutUserController,
    refreshTokenController,
    resetPasswordController,
    resetPasswordOtpController,
    verifyPasswordOtpController
 } from "../api/auth/auth.controller.js";
 import { userAuthenticate } from "../middlwares/user.authenticate.js";
 import { adminAuthController } from "../api/admin/auth/auth.controller.js";
 import { govAuthController } from "../api/auth/government/govAuth.controller.js";
 import { verifyOtpToken } from "../middlwares/verify.otp.token.js";


const router = Router();

router.post('/user/request-otp', requestRegisterOTPController);

router.post('/user/verify-otp', verifyRegisterOTPController);

router.post('/user/register', verifyOtpToken("REGISTER"), createUserController);

router.post('/user/login', loginUserController);

router.post('/user/refresh-token', refreshTokenController );

router.post('/user/logout', userAuthenticate,logoutUserController);


router.post('/user/request-password-reset-otp', resetPasswordOtpController);
router.post('/user/verify-password-reset-otp', verifyPasswordOtpController);
router.post('/user/reset-password', resetPasswordController);




router.post('/admin/login', adminAuthController); 
router.post('/officer/login', govAuthController);





export default router;