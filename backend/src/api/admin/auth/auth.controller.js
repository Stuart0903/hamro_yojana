import { adminAuthService } from "./auth.services.js";

export const adminAuthController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const result = await adminAuthService(email, password);
        return res.status(200).json({
            message: result.message,
            ...result
        })

    }catch (error) {
        console.error("Admin login error:", error);
        return res.status(401).json({ message: error.message || "Login failed" });
    }
} 