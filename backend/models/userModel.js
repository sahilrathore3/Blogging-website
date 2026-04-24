const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 20,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    followersCount: {
        type: Number,
        default: 0
    },

    followingCount: {
        type: Number,
        default: 0
    },

    subscribersCount: {
        type: Number,
        default: 0
    },
    subscribedToCount: {
        type: Number,
        default: 0
    },


}, { timestamps: true });

// PASSWORD HASHING HOOK
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const isAlreadyHashed = /^\$2[ayb]\$.{56}$/.test(this.password);

    if (isAlreadyHashed) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error("Password hashing failed: " + error.message);
    }
});

//  Compare Password Method (Login ke waqt easy rahega)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;