const mongoose = require("mongoose");
const doteEnv = require("dotenv");

doteEnv.config();
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully");
        return connection;
    } catch (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
