const User = require("../models/userModel.js");
const { verifyToken } = require("../utils/jwt.js");

exports.protect = async (req, res, next) => {

    try {

        let token;

        //  Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "You are not login. Please login first!."
            });
        }

        const decoded = await verifyToken(token);
        // console.log("Decoded Token Data:", decoded);

        //  Attach user to the request object (excluding password)
        try {
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                console.log("!!! ERROR: No user found in DB for ID:", decoded.id);
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            req.user = user;
            next();

        } catch (dbError) {
            console.error("!!! DATABASE ERROR !!!:", dbError.message);
            return res.status(500).json({ success: false, message: "Database lookup failed" });
        }

    } catch (error) {
        console.log("AUTH ERROR:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};