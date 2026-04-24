const mongoose = require('mongoose');


const userVerificationSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        minlength : 3,
        maxlength : 20,
        trim : true
    },

    email: {
        type : String ,
        required : true,
        unique : true,
        lowercase : true,        
    },
    
    password : {
        type : String,
        required : true,
    },
    
    otp: {
        code: {
            type : String,
            required : true
        },
        type: {
            type : String,
            enum : [
                'email verification',
                'password reset',
                'password change',
                'account deletion'
            ],
            required: true
        },
        
        expiresAt : {
            type : Date,
            default : Date.now,
            index: { expires: '10m' }
        }
    }

}, { timestamps : true });

const UserVerification  = mongoose.model('UserVerification' , userVerificationSchema);

module.exports = UserVerification;