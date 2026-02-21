import {otpGenerator} from "../../utils/otp.generator.js";
import { sendOtpSMS } from "../../utils/sms.sender.js";
import {prisma} from "../../config/db.config.js";
import {hashPassword, comparePassword} from "../../utils/hash.js";
import { generateToken, generateRefreshToken, revokeRefreshToken } from "../../utils/jwt.js";


export const requestOTP = async (mobileNumber) => {
    await prisma.oTPVerification.deleteMany({
        where : {expiresAt : {lt : new Date()}}
    });

    const otp = otpGenerator();
    const otpHash = await hashPassword(otp);

    await prisma.oTPVerification.create({
        data : {
            phoneNumber:mobileNumber,
            otpCode: otpHash,
            expiresAt : new Date(Date.now() + 5 * 60 * 1000)
        }
    });

    await sendOtpSMS(mobileNumber, otp);
    console.log(`OTP sent to ${mobileNumber}`);
    console.log("OTP:", otp);
    return {message: "OTP sent successfully"};
}

export const verifyOTP = async (mobileNumber, otp) => {
    await prisma.oTPVerification.deleteMany({
        where : {expiresAt : {lt : new Date()}}
    });

    const latestOTP = await prisma.oTPVerification.findFirst({
        where : {
            phoneNumber : mobileNumber,
            isUsed: false,
            expiresAt : {gt : new Date()}
        },
        orderBy : {
            createdAt : "desc"
        }
    });

    if (!latestOTP) {
        return {success: false, message: "No valid OTP found or expired"};
    }

    const isValid = await comparePassword(otp, latestOTP.otpCode);
    if (!isValid) {
        return {success: false, message: "Invalid OTP"};
    }

    await prisma.oTPVerification.update({
        where : {id : latestOTP.id},
        data : {isUsed : true}
    });

    return {success: true, message: "OTP verified successfully"};
}

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

    }

    );

    return {message: "User created successfully", userId: result.newUser.uid};
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



