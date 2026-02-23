import { Router } from "express";
import { requestOtpController,
    verifyOtpController,
    createUserController,
    loginUserController,
    logoutUserController,
    refreshTokenController,
    resetPasswordController,
 } from "../api/auth/auth.controller.js";
 import { userAuthenticate } from "../middlwares/user.authenticate.js";
 import { adminAuthController } from "../api/admin/auth/auth.controller.js";
 import { govAuthController } from "../api/auth/government/govAuth.controller.js";
 import { verifyOtpToken } from "../middlwares/verify.otp.token.js";


const router = Router();

router.post('/user/request-otp', requestOtpController);

router.post('/user/verify-otp', verifyOtpController);

router.post('/user/register', verifyOtpToken("REGISTER"), createUserController);

router.post('/user/login', loginUserController);

router.post('/user/refresh-token', refreshTokenController );

router.post('/user/logout', userAuthenticate,logoutUserController);


router.post('/user/request-password-reset-otp', requestOtpController);
router.post('/user/verify-password-reset-otp', verifyOtpController);
router.post('/user/reset-password', resetPasswordController);




router.post('/admin/login', adminAuthController); 
router.post('/officer/login', govAuthController);





export default router;