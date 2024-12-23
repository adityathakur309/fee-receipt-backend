const mongoose = require("mongoose");

const feeReceiptSchema = new mongoose.Schema({
    receiptNumber: { type: String, required: true, unique: true },
    dateOfPayment: { type: Date, required: true },
    studentName: { type: String, required: true },
    studentID: { type: String, required: true },
    courseName: { type: String, required: true },
    feeFrequency: { type: String, required: true,}, 
    amount: { type: Number, required: true },
    modeOfPayment: { type: String, required: true,},
    feeDescription: { type: String },
    transactionID: { type: String, required: true, unique: true },
}, { timestamps: true });

const feeReceiptModel = mongoose.model("FeeReceipt", feeReceiptSchema);

module.exports = feeReceiptModel;
