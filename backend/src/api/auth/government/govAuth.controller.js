import { govAuthService} from "./govAuth.services.js";

export const govAuthController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await govAuthService(email, password);

        return res.status(200).json(result);

    }catch (error) {
        console.error("Government auth error:", error);
        return res.status(400).json({ message: error.message });
    }
}