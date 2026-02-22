import {otpGenerator} from "../../utils/otp.generator.js";
import { sendOtpSMS } from "../../utils/sms.sender.js";
import {prisma} from "../../config/db.config.js";
import {hashPassword, comparePassword} from "../../utils/hash.js";
import { generateToken, generateRefreshToken, revokeRefreshToken } from "../../utils/jwt.js";
import jwt from "jsonwebtoken";
// import { otpGenerator } from "../../utils/otp.generator.js";


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
            isUsed: false,
            purpose: "PHONE_VERIFICATION",
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

export const forgotPasswordService = async (phoneNumber) => {
    const user = await prisma.user.findUnique({
        where: {phoneNumber}
    });

    if (!user) {
        throw new Error("User with this phone number does not exist");
    }

    const otp = otpGenerator();

    await prisma.oTPVerification.create({
        data: {
            phoneNumber,
            otpCode: await hashPassword(otp),
            purpose: "PASSWORD_RESET",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            isUsed: false
        }
    })

    await sendOtpSMS(phoneNumber, otp);

    // Simulate sending OTP (in a real app, this would send an SMS)
    console.log(`Password reset OTP for ${phoneNumber}: ${otp}`);

    return {message: "OTP sent successfully"};




}

export const verifyResetOtpService = async (phoneNumber, otp) => {
    const record = await prisma.oTPVerification.findFirst({
        where: {
            phoneNumber,
            purpose: "PASSWORD_RESET",
            isUsed: false,
        },
        orderBy: { createdAt: "desc" }
    });

    if (!record) {
        throw new Error("No OTP request found for this phone number");
    }

    if (record.expiresAt < new Date()) {
        throw new Error("OTP has expired");
    }

    if (record.attempt >= 5) {
        throw new Error("Maximum OTP verification attempts exceeded");
    }

    const isOtpValid = await comparePassword(otp, record.otpCode);

    console.log("isOtpValid:", isOtpValid);
    console.log("OTP record:", record.otpCode);

    if (!isOtpValid) {
        await prisma.oTPVerification.update({
            where: {id: record.id},
            data: {attempt: record.attempt + 1}
        });
        throw new Error("Invalid OTP");
    }

    await prisma.oTPVerification.update({
        where: {id: record.id},
        data: {isUsed: true}
    })

    const resetToken = jwt.sign(
        {phoneNumber, purpose: "PASSWORD_RESET"},
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    )

    return resetToken;
}


export const resetPasswordService = async (resetToken, newPassword) => {
    let decoded;

    try {
        decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    }catch {
        throw new Error("Invalid or expired reset token");
    }

    if (decoded.purpose !== "PASSWORD_RESET") {
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








