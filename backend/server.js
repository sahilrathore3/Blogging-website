require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require('cors');
const path = require('path');

connectDB();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoute = require("./routers/authRoute");
const adminRoute = require("./routers/adminRoute");
const userRoute = require("./routers/userRoutes");
const blogRoute = require("./routers/blogRoute");


app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);
app.use("/api/blog",blogRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is runnning on port : ${port} `);
});