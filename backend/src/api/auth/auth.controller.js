import {
    requestOtpService,
    verifyOtpService,
    createUser,
    loginUser,
    refreshTokenService,
    resetPasswordService,
} from "./auth.service.js";


import {revokeRefreshToken} from "../../utils/jwt.js";


export const requestOtpController = async (req, res)=> {
    try {
        const { phoneNumber, purpose } = req.body;

        if (!phoneNumber || !purpose) {
            return res.status(400).json({ message: "Phone number and purpose are required" });
        }

        const result = await requestOtpService(phoneNumber, purpose);
        res.status(200).json(result);


    }catch (err) {
        console.error("Error in requestOTPController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const verifyOtpController = async (req, res) => {
    try {
        const { phoneNumber, otp, purpose } = req.body;

        if (!phoneNumber || !otp || !purpose) {
            return res.status(400).json({ message: "Phone number, OTP and purpose are required" });
        }

        const result = await verifyOtpService(phoneNumber, otp, purpose);

        if (result) {
            return res.status(200).json({
                success: true,
                message: "OTP verified successfully",
                verificationToken: result.verificationToken
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

    }catch (err) {
        console.error("Error in verifyOTPController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const createUserController = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res.status(400).json({ message: "Mobile number and password are required" });
    }

    if (req.verifiedPhoneNumber !== mobileNumber) {
      return res.status(400).json({ message: "Phone number mismatch" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const result = await createUser(mobileNumber, password);
    return res.status(201).json(result);

  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const loginUserController = async (req, res) => {
    try {
        const { mobileNumber, password } = req.body;
        if (!mobileNumber || !password) {
            return res.status(400).json({ message: "Mobile number and password are required" });
        }

        const result = await loginUser(mobileNumber, password);

        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        return res.status(200).json({ 
            message: "Login successful", 
            user: result.userId,
            token: result.accessToken,
            refreshToken: result.refreshToken
        });
    }catch (err) {
        console.error("Error in loginUserController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const refreshTokenController = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        const result = await refreshTokenService(refreshToken);
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        return res.status(200).json(result);
    }catch (err) {
        console.error("Error in refreshTokenController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const logoutUserController = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        await revokeRefreshToken(refreshToken);
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logout successful" }); 
    }catch (err) {
        console.error("Error in logoutUserController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

// export const resetPasswordOtpController = async (req, res) => {
//     try {
//         const {phoneNumber} = req.body;
//         if (!phoneNumber) {
//             return res.status(400).json({ message: "Phone number is required" });
//         }
//         const result = await forgotPasswordService(phoneNumber);
//         return res.status(200).json(result);
//     }catch (err) {
//         console.error("Error in resetPasswordOtpController:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }

// export const verifyPasswordOtpController = async (req, res) => {
//     try {
//         const {phoneNumber, otp} = req.body;
//         const resetToken = await verifyResetOtpService(phoneNumber, otp);
//         if (resetToken) {
//             return res.status(200).json({
//                 success: true,
//                 message: "OTP verified successfully",
//                 resetToken
//             });
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid OTP"
//             });
//         }

//     }catch (err) {
//         console.error("Error in verifyPasswordOtpController:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }

// }

export const resetPasswordController = async (req, res) => {
    try {
        const {resetToken, newPassword} = req.body;

        await resetPasswordService(resetToken, newPassword);

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    }catch (err) {
        console.error("Error in resetPasswordController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

