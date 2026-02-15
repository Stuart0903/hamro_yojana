import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const options = {
  expiresIn: process.env.JWT_EXPIRES_IN,
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};
