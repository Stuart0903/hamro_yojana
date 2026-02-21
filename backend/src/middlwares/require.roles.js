export const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user){
                return res.status(401).json({ message: "Unauthorized: No user information found" });
            }

            const hasPermission = req.user.roles.some((role)=> 
                allowedRoles.includes(role)
            );

            if (!hasPermission) {
                return res.status(403).json({ message: "Forbidden: You do not have the required permissions" });
            }

            next();

        }catch (error) {
            console.error("Role verification error:", error);
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }
}