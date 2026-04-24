const jwt = require('jsonwebtoken');
const User = require("../models/userModel");



exports.generateToken =  (user) =>{
    if(!process.env.JWT_SECRET){
        throw new Error("JWT_SECRET is missing");
    }

    return jwt.sign(
        { id : user._id },
        process.env.JWT_SECRET,
        {expiresIn:"10d"}
    )
};

exports.verifyToken = (token) =>{
    return jwt.verify(token,process.env.JWT_SECRET)
};