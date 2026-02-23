import {otpGenerator} from "../../utils/otp.generator.js";
import { sendOtpSMS } from "../../utils/sms.sender.js";
import {prisma} from "../../config/db.config.js";
import {hashPassword, comparePassword} from "../../utils/hash.js";
import { generateToken, generateRefreshToken, revokeRefreshToken } from "../../utils/jwt.js";
import jwt from "jsonwebtoken";
// import { otpGenerator } from "../../utils/otp.generator.js";


export const requestRegisterOtpService = async (phoneNumber) => {
    const existingUser = await prisma.user.findUnique({
        where: {phoneNumber}
    });

    if(existingUser) {
        throw new Error("User with this phone number already exists");
    }

    const existingOtp = await prisma.oTPVerification.findFirst({
        where: {
            phoneNumber,
            purpose: "REGISTER",
            isUsed: false,
            expiresAt: {gt: new Date()}
        }
    });

    if (existingOtp) {
        throw new Error("OTP already sent for this phone number");
    }

    const otp = otpGenerator();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTPVerification.create({
        data: {
            phoneNumber,
            otpCode: otp,
            purpose: "REGISTER",
            expiresAt,
            isUsed: false
        },
    });
    console.log(`Generated OTP for ${phoneNumber}: ${otp}`);

    await sendOtpSMS(phoneNumber, otp);

    return {message: "OTP sent successfully"};
}

export const requestOtpService = async (phoneNumber, purpose) => {
    //Delete old unused OTP for same purpose
    await prisma.oTPVerification.deleteMany({
        where: {
            phoneNumber,
            purpose,
            isUsed: false
        }
    });

    const otp = otpGenerator();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTPVerification.create({
        data : {
            phoneNumber,
            otpCode: otp, 
            purpose,
            expiresAt,
        }
    });

    console.log(`Generated OTP for ${phoneNumber} and purpose ${purpose}: ${otp}`);

    await sendOtpSMS(phoneNumber, otp);
    return {message: "OTP sent successfully"};
}

export const verifyOtpService = async (phoneNumber, otp, purpose) => {
    const record = await prisma.oTPVerification.findFirst({
        where: {
            phoneNumber,
            purpose,
            isUsed: false,
            expiresAt: {gt: new Date()}
        },
        orderBy: { createdAt: "desc" }
    });

    if (!record){
        throw new Error("Invalid or expired OTP");
    }

    if (record.attempt >= 5) {
        throw new Error("Maximum OTP verification attempts exceeded");
    }

    if (record.expiresAt < new Date()) {
        throw new Error("OTP has expired");
    }

    if (record.otpCode !== otp) {
        await prisma.oTPVerification.update({
            where: {id: record.id},
            data: {attempt: record.attempt + 1}
        });
        throw new Error("Invalid OTP");
    }


    await prisma.oTPVerification.update({
        where: {id: record.id},
        data: {isUsed: true}
    });

    const token = jwt.sign(
        {phoneNumber, purpose},
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    );

    return {
        message: "OTP verified successfully",
        verificationToken:  token
    }
}



// export const verifyRegisterOtpService = async (phoneNumber, otp) => {

//     const record = await prisma.oTPVerification.findFirst({
//         where: {
//             phoneNumber,
//             purpose: "REGISTER",
//             isUsed: false, 
//         },
//         orderBy: { createdAt: "desc" }
//     });

//     console.log("OTP record for verification:", record);

//     if (!record) {
//         throw new Error("No OTP request found for this phone number");
//     }

//     if (record.expiresAt < new Date()) {
//         throw new Error("OTP has expired");
//     }

//     if (record.attempt >= 5) {
//         throw new Error("Maximum OTP verification attempts exceeded");
//     }

//     if (record.otpCode !== otp) {
//         await prisma.oTPVerification.update({
//             where: {id: record.id},
//             data: {attempt: record.attempt + 1}
//         });
//         throw new Error("Invalid OTP");
//     }

//     await prisma.oTPVerification.update({
//         where: {id: record.id},
//         data: {isUsed: true}
//         });

//     const verificationToken = jwt.sign(
//         {phoneNumber, purpose: "REGISTER"},
//         process.env.JWT_SECRET,
//         {expiresIn: "15m"}
//     )

//     return verificationToken;
// }

export const createUser = async (mobileNumber, password) => {
    const usedOtp = await prisma.oTPVerification.findFirst({
        where : {
            phoneNumber : mobileNumber,
            isUsed : true
        },
        orderBy : {
            createdAt : "desc"
        }
    });

    console.log("Used OTP record for user creation:", usedOtp);

    if (usedOtp === false) {
        throw new Error("OTP verification required to create user");
    }

    const existingUser = await prisma.user.findUnique({
        where : {phoneNumber : mobileNumber}
    });

    if (existingUser) {
        throw new Error("User with this phone number already exists");
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {

        //Create user
        const newUser = await tx.user.create({
            data : {
                phoneNumber: mobileNumber,
                passwordHash: hashedPassword,
                isPhoneVerified:true,
            }
        })

        //Get Citizen Role
        const citizenRole = await tx.role.findUnique({
            where : {name : "CITIZEN"}
        })

        if (!citizenRole) {
            throw new Error("Citizen role not found in database");
        }

        await tx.userRole.create({
            data : {
                userId: newUser.uid,
                roleId: citizenRole.id
            }
        })

        // Create citizen profile
        await tx.citizenProfile.create({
            data: {
                userId: newUser.uid,
            }
        });

        //Delete OTP records for this phone number
        await tx.oTPVerification.deleteMany({
            where : {
                phoneNumber : mobileNumber
            }
        });
        console.log(newUser);

        return newUser;
    }
    );
    console.log("User created with ID:", result.uid);

    return {message: "User created successfully", userId: result.uid};
}

export const loginUser = async (mobileNumber, password) => {
    const user = await prisma.user.findUnique({
        where : {phoneNumber : mobileNumber}
    });
    console.log("User found:", user);

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.isPhoneVerified) {
        throw new Error("Phone number not verified");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    const accessToken = generateToken({
         userId: user.uid,
         mobileNumber: user.phoneNumber
        });

    const refreshToken = await generateRefreshToken(user);

    return {
        message: "Login successful",    
        accessToken,
        refreshToken,
        userId: user.uid
    }
   
}

export const refreshTokenService = async (refreshToken) => {
    const storedToken = await prisma.refreshToken.findUnique({
        where: {token: refreshToken},
        include: {user: true}
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        throw new Error("Invalid or expired refresh token");
    }

    await revokeRefreshToken(refreshToken);

    const newAccessToken = generateToken({
        userId: storedToken.user.uid,
        mobileNumber: storedToken.user.phoneNumber
    });

    const newRefreshToken = await generateRefreshToken(storedToken.user);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}

// export const forgotPasswordService = async (phoneNumber) => {
//     const user = await prisma.user.findUnique({
//         where: {phoneNumber}
//     });

//     if (!user) {
//         throw new Error("User with this phone number does not exist");
//     }

//     const otp = otpGenerator();

//     await prisma.oTPVerification.create({
//         data: {
//             phoneNumber,
//             otpCode: await hashPassword(otp),
//             purpose: "PASSWORD_RESET",
//             expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//             isUsed: false
//         }
//     })

//     await sendOtpSMS(phoneNumber, otp);

//     // Simulate sending OTP (in a real app, this would send an SMS)
//     console.log(`Password reset OTP for ${phoneNumber}: ${otp}`);

//     return {message: "OTP sent successfully"};




// }

// export const verifyResetOtpService = async (phoneNumber, otp) => {
//     const record = await prisma.oTPVerification.findFirst({
//         where: {
//             phoneNumber,
//             purpose: "PASSWORD_RESET",
//             isUsed: false,
//         },
//         orderBy: { createdAt: "desc" }
//     });

//     if (!record) {
//         throw new Error("No OTP request found for this phone number");
//     }

//     if (record.expiresAt < new Date()) {
//         throw new Error("OTP has expired");
//     }

//     if (record.attempt >= 5) {
//         throw new Error("Maximum OTP verification attempts exceeded");
//     }

//     const isOtpValid = await comparePassword(otp, record.otpCode);

//     console.log("isOtpValid:", isOtpValid);
//     console.log("OTP record:", record.otpCode);

//     if (!isOtpValid) {
//         await prisma.oTPVerification.update({
//             where: {id: record.id},
//             data: {attempt: record.attempt + 1}
//         });
//         throw new Error("Invalid OTP");
//     }

//     await prisma.oTPVerification.update({
//         where: {id: record.id},
//         data: {isUsed: true}
//     })

//     const resetToken = jwt.sign(
//         {phoneNumber, purpose: "PASSWORD_RESET"},
//         process.env.JWT_SECRET,
//         {expiresIn: "15m"}
//     )

//     return resetToken;
// }




export const resetPasswordService = async (resetToken, newPassword) => {
    let decoded;

    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    }catch {
        throw new Error("Invalid or expired reset token");
    }

    if (decoded.purpose !== "RESET_PASSWORD") {
        throw new Error("Invalid reset token");
    }

    const user = await prisma.user.findUnique({
        where: {phoneNumber: decoded.phoneNumber}
    });

    if (!user) {
        throw new Error("User not found");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: {uid: user.uid},
        data: {passwordHash: hashedPassword}
    });

}








