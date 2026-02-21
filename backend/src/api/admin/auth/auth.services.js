import { generateToken, generateRefreshToken } from "../../../utils/jwt.js";
import {prisma} from "../../../config/db.config.js"
import { comparePassword } from "../../../utils/hash.js";


export const adminAuthService = async (email, password) => {
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

    const hasOfficerRole = user.userRoles.some((ur) => 
        ["SUPER_ADMIN"].includes(ur.role.name)
    )


    if (!hasOfficerRole) {
        throw new Error("User does not have admin privileges");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    const accessToken = generateToken({
         userId: user.uid,
         email: user.email,
         roles: user.userRoles.map(ur => ur.role.name),
        // roles: "PROVINCE_OFFICER",
         jurisdictionsLevel: user.officeProfile?.jurisdictionLevel || null,
        });

    const refreshToken = await generateRefreshToken(user);

    // await prisma.refreshToken.create({
    //     data: {
    //         token: refreshToken,
    //         userId: user.uid,
    //             expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    //     }
    // });

    return { 
        message: "Login successful",
        accessToken,
        refreshToken,
        userId: user.uid,
        mustChangePassword: user.mustChangePassword
    }
}