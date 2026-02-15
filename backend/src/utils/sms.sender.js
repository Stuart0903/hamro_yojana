import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

export const sendOtpSMS = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: "+977" + phone,
    });

    console.log(`OTP sent to ${phone}`);
  } catch (err) {
    console.error("Error sending SMS:", err);
    throw new Error("Failed to send OTP SMS");
  }
};


