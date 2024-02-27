const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminId:{type:String , required:true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  constituency: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['user', 'admin'], required: true },
  aadharImage:{type:String , required: true},
  profileImage:{type:String, required:true},
  verified: { type: Boolean, default: false } 
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
