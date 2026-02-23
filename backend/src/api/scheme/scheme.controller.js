
import { getAllSchemesService } from "./scheme.services.js";
import {prisma} from "../../config/db.config.js";

export const getAllSchemesController = async (req, res) => {
    try {

        const result = await getAllSchemesService(req.query);

        res.status(200).json({
            success: true,
            ...result
        });
    }catch (err) {
        console.error("Error in getAllSchemesController:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}