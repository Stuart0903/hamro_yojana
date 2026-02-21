import {prisma} from "../../../config/db.config.js";
import { comparePassword } from "../../../utils/hash.js";
import { generateToken, generateRefreshToken } from '../../../utils/jwt.js'

export const govAuthService = async (email, password) => {
    const user = await prisma.user.findUnique({
        where : { email },
        include : {
            userRoles : {
                include : {
                    role : true
                }
             },
             officeProfile: true
        }
    })

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.status || user.status !== "ACTIVE") {
        throw new Error("User is not active");
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
        throw new Error("Invalid password");
    }

    if (!user.officeProfile) {
        throw new Error("User does not have an office profile");
    }

    const roles = user.userRoles.map(ur => ur.role.name);

    if (roles.length === 0) {
        throw new Error("User does not have any roles assigned");
    }

    const accessToken = generateToken({
         userId: user.uid,
         email: user.email,
         roles,
         jurisdictionsLevel: user.officeProfile.jurisdictionLevel,
        });

    const refreshToken = await generateRefreshToken(user);

    return { 
        message: "Login successful",
        accessToken,
        refreshToken,
        userId: user.uid,
    }

}