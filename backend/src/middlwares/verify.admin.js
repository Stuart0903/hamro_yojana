// import { JurisdictionLevel } from "../../generated/prisma/enums.ts";
import {prisma} from "../config/db.config.js"
import jwt from "jsonwebtoken";

export const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { uid: decoded.userId },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }, 
                },
                officeProfile: true
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        if (!user.status || user.status !== "ACTIVE") {
            return res.status(403).json({ message: "Forbidden: User is not active" });
        }

        req.user = {
            id: user.uid,
            roles: user.userRoles.map(ur => ur.role.name),
            jurisdictionsLevel: user.officeProfile?.jurisdictionLevel || null
        }


        // if (!user || !user.userRoles || user.userRoles.length === 0) {
        //     return res.status(403).json({ message: "Forbidden: User is not an admin" });
        // }
        // req.user = user;
        // next();

        next();
    }catch (error) {
        console.error("Admin verification error:", error);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
}