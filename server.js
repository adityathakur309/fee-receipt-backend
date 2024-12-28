const express = require("express");
const app = express();
const connectDB = require("./config/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const userModel = require("./models/user-model");
const cookieParser = require("cookie-parser");
const feeReceiptModel = require("./models/student-receipt-model");
let PORT = process.env.PORT || 5000;

dotenv.config();
connectDB();

// Middleware and parser setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Auth middleware
const isLoggedIn = async (req, res, next) => {
    try {
        let { name, password } = req.body;
        let token = req.cookies.token || "";

        // Find the user in the database
        let user = await userModel.findOne({ name });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the password matches
        if (password !== user.password) {
            return res.json({
                success: false,
                message: "Email or password incorrect",
            });
        }

        // If no token exists, generate and set a new token
        if (!token) {
            token = jwt.sign({ name }, process.env.JWT_SECRET);
            res.cookie("token", token, { httpOnly: true });
            req.token = token;
        } else {
            // Verify the token if it already exists
            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.json({
                    success: false,
                    message: "Invalid or expired token",
                });
            }
        }

        next();
    } catch (error) {
        res.json({
            success: false,
            message: `An error occurred: ${error.message}`,
        });
    }
};
// get home route 
app.get("/", async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ name: "netcoder@2024" });
        if (existingUser) {
            return res.send("User already exists in the database.");
        }
        const user = await userModel.create({
            name: process.env.NAME,
            password: process.env.PASSWORD
        });
        const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET, {
            expiresIn: "12h",
        });
        res.cookie("token", token, { httpOnly: true });
        res.json({
            success: true,
            message: "User created successfully.",
            token,
        });
    } catch (error) {
        res.json({
            success: false,
            message: `Error creating user: ${error.message}`,
        });
    }
});


// end 

// login route
app.post("/users/login", isLoggedIn, (req, res) => {
    res.json({
        success: true,
        message: "you can generate and find receipt",
        token:req.token ||""
    })
})

// end 
// logout route 
app.get("/logout", (req, res) => {
    if (req.cookies) {
        res.cookie("token", "", { maxAge: 0, httpOnly: true, secure: true });
        res.json({
            success: true,
            message: "your account has been logged out",
            token:"",
        })
    }

})
// end 

// generate a receipt from front

app.post("/receipts/create-receipt", async (req, res) => {
    try {
        const {
            receiptNumber,
            dateOfPayment,
            studentName,
            studentID,
            courseName,
            feeFrequency,
            amount,
            modeOfPayment,
            feeDescription,
            transactionID,
        } = req.body;

        // Create a new receipt
        const newReceipt = await feeReceiptModel.create({
            receiptNumber,
            dateOfPayment,
            studentName,
            studentID,
            courseName,
            feeFrequency,
            amount,
            modeOfPayment,
            feeDescription,
            transactionID,
        });

        res.status(201).json({
            success: true,
            message: "Fee receipt created successfully",
            receipt: newReceipt,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error creating fee receipt: ${error.message}`,
        });
    }
});
// end 

// find receipt 
app.post("/receipts/find", async (req, res) => {
    try {
        const { studentId } = req.body || "";
        const receipts = await feeReceiptModel.find({ studentID: studentId });
        if (receipts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No receipts found matching the given criteria."
            });
        }

        // Return found receipts
        return res.status(200).json({
            success: true,
            data: receipts
        });
    } catch (error) {
        // Enhanced error logging
        console.error("Error in /receipts/find endpoint:", {
            message: error.message,
            stack: error.stack,
            requestBody: req.body,
        });

        // Return server error response
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
});



// end 



// Start the server
app.listen(PORT, () =>
    console.log(`Server is running on port [${PORT}]`)
);
