import jwt from 'jsonwebtoken';

export const verifyOtpToken = (requiredPurpose) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;


            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: "OTP verification required" });
            }

            const token = authHeader.split(' ')[1];


            const decoded = jwt.verify(token, process.env.JWT_SECRET);


            if (decoded.purpose !== requiredPurpose) {
                return res.status(401).json({ message: "Invalid OTP token purpose" });
            }

            req.verifiedPhoneNumber = decoded.phoneNumber

            console.log(`request for ${requiredPurpose} with verified phone number:`, req.verifiedPhoneNumber);

            next();

        }catch (err){
            return res.status(400).json({ message: "Invalid or expired OTP token" });
        }
    }
}