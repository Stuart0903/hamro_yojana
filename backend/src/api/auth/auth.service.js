import {otpGenerator} from "../../utils/otp.generator.js";
import { sendOtpSMS } from "../../utils/sms.sender.js";
import {prisma} from "../../config/db.config.js";
import {hashPassword, comparePassword} from "../../utils/hash.js";
import { generateToken, generateRefreshToken } from "../../utils/jwt.js";


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

    const newUser = await prisma.user.create({
        data : {
            phoneNumber : mobileNumber,
            passwordHash : hashedPassword,
            isPhoneVerified: true,
        }
    });

    await prisma.oTPVerification.deleteMany({
        where : {
            phoneNumber : mobileNumber
        }
    });

    await prisma.citizenProfile.create({
        data: {
            userId: newUser.uid,
        }

    })

    return {message: "User created successfully", userId: newUser.id};
}

export const loginUser = async (mobileNumber, password) => {
    const user = await prisma.user.findUnique({
        where : {phoneNumber : mobileNumber}
    });

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

    return {
        message: "Login successful",    
        accessToken,
        userId: user.uid
    }
   
}



