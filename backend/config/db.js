const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected Successfully!");
    } catch (error) {
        console.log("Database connection failed :" , error.message);
        process.exit(1);
    }
}

module.exports = connectDB;