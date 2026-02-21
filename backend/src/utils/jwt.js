import jwt from "jsonwebtoken";
import crypto from "crypto";
import {prisma } from "../config/db.config.js";

const JWT_SECRET = process.env.JWT_SECRET;

const options = {
  expiresIn: "1h",
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = async (user) => {
  const token = crypto.randomBytes(40).toString("hex");

  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.uid,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }
  });
  return token;
}

export const revokeRefreshToken = async (token) => {
  await prisma.refreshToken.update({
    where: { token },
    data: { isRevoked: true },
  })
}
