const mongoose = require("mongoose");

 let userSchema = mongoose.Schema({
    name:String,
    password:String,
})

let userModel = mongoose.model("user",userSchema);
module.exports = userModel;