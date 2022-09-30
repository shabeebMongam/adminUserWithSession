const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    adminemail: String,
    adminpassword : String
})

const Admin  =new mongoose.model("Admin",adminSchema);

module.exports = Admin