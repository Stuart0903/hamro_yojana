import {
    requestOTP,
    verifyOTP,
    createUser,
    loginUser
} from "./auth.service.js";

export const requestOTPController = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const result = await requestOTP(phoneNumber);
        res.status(200).json(result);
    }catch (err) {
        console.error("Error in requestOTPController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyOTPController = async (req, res) => {
    try{
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required" });
        }

        const result = await verifyOTP(phoneNumber, otp);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
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
            token: result.accessToken
        });
    }catch (err) {
        console.error("Error in loginUserController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logoutUserController = (req, res) => {
    try {
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