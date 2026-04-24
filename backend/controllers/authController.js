const User = require('../models/userModel');
const UserVerification = require("../models/userVerificationModel");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../utils/nodeMailerHelperFunction");
const { sendOTPEmail, sendWelcomeEmail ,sendForgotPasswordEmail ,sendResetPasswordEmail} = require("../utils/emailTemplates");
const { generateToken } = require("../utils/jwt");



exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username,Email,Password are required"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otpCode, salt);
        const hashedPassword = await bcrypt.hash(password, salt);


        //    Pehle purane pending records delete karna taaki conflict na ho
        await UserVerification.findOneAndDelete({ email });

        //  save in temporary model ===>>
        await UserVerification.create({
            username,
            email,
            password: hashedPassword,
            otp: {
                code: hashedOTP,
                type: 'email verification',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        });

        await sendOTPEmail(email, username, otpCode);


        return res.status(200).json({
            success: true,
            message: "OTP sent to your email !"
        });


    } catch (error) {

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue);
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}





exports.verifyAndSignup = async (req, res) => {
    try {
        
        const { email, otpCode } = req.body;

        const record = await UserVerification.findOne({ email });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Session expired or user not found. Please resend OTP."
            });
        }

        if (record.otp.expiresAt < Date.now()) {
            return res.status(400).json({ 
                success: false,
                 message: "OTP has expired" });
        }

        const isMatch = await bcrypt.compare(otpCode, record.otp.code);
        if (!isMatch) {
            return res.status(400).json({
                 success: false,
                 message: "Invalid OTP" });
        }

        const user = await User.findOneAndUpdate(
            { email: record.email }, 
            { 
                username: record.username,
                password: record.password, 
                isVerified: true 
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        
        await UserVerification.deleteOne({ email });

        await sendWelcomeEmail(user.email, user.username);

        return res.status(201).json({
            success: true,
            message: "Account Verified and created Successfully!",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false,
             message: error.message });
    }
};




//   login  =========>>>

    // exports.loginUser = async(req , res) =>{
    //     try {   
    //         const { email , password } = req.body;

    //         if(!email || !password) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "Email and Password are required"
    //             });
    //         }

    //         const user = await User.findOne({email}).select("+password");
    //         if(!user){
    //             return res.status(401).json({
    //                 success: false,
    //                 message:"Invalid email or password"
    //             });
    //         }

    //         if (user.isVerified === false) {
    //         return res.status(403).json({ 
    //             success: false, 
    //             message: "Your account is not verified. Please verify your email first." 
    //         });
    //     }

    //         const isMatch = await bcrypt.compare(password, user.password);
    //         if(!isMatch){
    //             return res.status(401).json({
    //                 success: false,
    //                 message:"Invalid email or password"  
    //             });
    //         }

    //         const token = generateToken(user);

    //         //  Success Response
    //      // Security: Response mein password nhi bhejna
    //         user.password = undefined;

    //         return res.status(200).json({
    //             success: true,
    //             message: `Welcome back, ${user.username}!`,
    //             data: {
    //                 token,
    //                 user:{
    //                     _id: user._id,
    //                     username: user.username,
    //                     email: user.email,
    //                     role: user.role
    //                 }
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Login Error :", error.message);

    //         return res.status(500).json({
    //             success: false,
    //             message: "Internal Server Error"
    //         });
    //     }
    // }

    exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                 message: "Email and Password are required" 
                });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ 
                success: false,
                 message: "Invalid email or password"
                 });
        }

   
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password"
             });
        }

   
        if (user.isVerified === false) {
           
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const salt = await bcrypt.genSalt(10);
            const hashedOTP = await bcrypt.hash(otpCode, salt);

            // UserVerification table update karo taaki user verify kar sake
            await UserVerification.findOneAndUpdate(
                { email: email },
                {
                    username: user.username,
                    email: user.email,
                    password: user.password, // Temporary store for verification
                    otp: {
                        code: hashedOTP,
                        type: 'email verification',
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000) 
                    }
                },
                { upsert: true }
            );

           
            await sendOTPEmail(email, user.username, otpCode);

            return res.status(403).json({
                success: false,
                unverified: true, // Frontend isse pehchanega
                message: "Your account is not verified. OTP has been sent to your email."
            });
        }

        //  SUCCESS (Agar password sahi hai aur user verified bhi hai)
        const token = generateToken(user);
        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.username}!`,
            data: {
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error("Login Error :", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}



 // Resend otp ==>
     
    exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        //  Pehle Permanent User table mein dekho
        let user = await User.findOne({ email });
        
        //  Agar permanent mein nahi hai, toh dekho kya temporary (Verification) table mein hai?
        // (Ye case tab hoga jab user ne signup kiya par abhi tak pehli baar bhi verify nahi hua)
        if (!user) {
            user = await UserVerification.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({
                 success: false, 
                 message: "User not found. Please signup again."
                 });
        }

       
        if (user.isVerified) {
            return res.status(400).json({
                 success: false,
                 message: "Account already verified. Please login." 
                });
        }

     
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", otpCode);
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otpCode, salt);

        
        await UserVerification.findOneAndUpdate(
            { email },
            {
                username: user.username,
                email: user.email,
                password: user.password, 
                otp: {
                    code: hashedOTP,
                    type: 'email verification',
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            },
            { upsert: true, new: true }
        );

        console.log("Sending email to:", email);
        await sendOTPEmail(email, user.username, otpCode);
        console.log("Email function executed!");

        res.status(200).json({ success: true, 
            message: "A new OTP has been sent to your email!"
         });

    } catch (error) {
        res.status(500).json({
             success: false,
             message: error.message 
            });
    }
};



// forgot password 

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                 success: false, 
                 message: "Email is required"
                 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "No account found with this email address" 
            });
        }


        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otpCode, salt);

        await UserVerification.findOneAndUpdate(
            { email: email },
            {
                username: user.username,
                email: user.email,
                password: user.password, 
                otp: {
                    code: hashedOTP,
                    type: 'password reset',
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
                }
            },
            { upsert: true, new: true }
        );

        await sendForgotPasswordEmail(email, user.username, otpCode);

        return res.status(200).json({
            success: true,
            message: "A password reset OTP has been sent to your email!"
        });

    } catch (error) {
        console.error("Forgot Password Error:", error.message);
        return res.status(500).json({ 
            success: false,
             message: "Internal Server Error" 
            });
    }
};


// reset password  

exports.resetPassword = async (req, res) => {
    try {
        const { email, otpCode, newPassword } = req.body;

        if (!email || !otpCode || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        //  Check for OTP record
        const record = await UserVerification.findOne({ email });
        if (!record || record.otp.type !== 'password reset') {
            return res.status(404).json({
                 success: false,
                 message: "Invalid request or OTP expired" 
                });
        }

        //  Check Expiry
        if (record.otp.expiresAt < Date.now()) {
            await UserVerification.deleteOne({ email });
            return res.status(400).json({ success: false, 
                message: "OTP has expired"
             });
        }

        //  Verify OTP
        const isMatch = await bcrypt.compare(otpCode, record.otp.code);
        if (!isMatch) {
            return res.status(400).json({
                 success: false,
                  message: "Incorrect OTP" 
                });
        }

        //  Update Password in Permanent User Model
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        );

        //  Cleanup temporary  record
        await UserVerification.deleteOne({ email });

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully! You can now login."
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
             message: error.message
             });
    }
};



// chnage password

// exports.changePassword = async (req, res) => {
//     try {
//         const { oldPassword, newPassword } = req.body;

//         if (!oldPassword || !newPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide both old and new password"
//             });
//         }

//         //  User ko database se nikalna (Middleware ne req.user mein ID di hai)
//         // Password ko humein manually select karna padega kyunki model mein wo "select: false" hota hai
//         const user = await User.findById(req.user._id).select("+password");

//         // 3. Purane password ko check karna
//         const isMatch = await bcrypt.compare(oldPassword, user.password);
//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Old password is incorrect"
//             });
//         }

//         // 4. Naye password ko hash karna
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword, salt);

//         // 5. Database update karna
//         user.password = hashedPassword;
//         await user.save();

//         return res.status(200).json({
//             success: true,
//             message: "Password changed successfully!"
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };




exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both old and new password"
            });
        }

        // User fetch karo password ke saath
        const user = await User.findById(req.user._id).select("+password");

        // Bcrypt compare (bcrypt import hona chahiye upar)
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        // Direct assign karo, Model ka pre-save hook ise hash kar dega
        user.password = newPassword;
        await user.save(); 

        return res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};