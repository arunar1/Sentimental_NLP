const express = require('express');
const bcrypt = require('bcryptjs');
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');
const { getRandomCode } = require('../RandomCodeGen/random');
const router = express.Router();

router.post('/', async (req, res) => {
    const picdata = req.body;
    const data = req.body.info;

    console.log(data);
    console.log(picdata)
    
    const userType = data.userType;
    const code = req.body.verificationCode;
    const search = { "aadharNo": data.aadharNo };

    console.log(code)

    let randomCode=getRandomCode();
    if(randomCode==code){
        try {
            if (userType === 'user') {
                const existingUser = await user.findOne(search);
                if (existingUser) {
                    console.log("User exists");
                    return res.status(400).json({ error: 'User already exists with this Aadhar number' });
                }
    
                const hashedPassword = await bcrypt.hash(data.password, 10);
                console.log("hello")
                const newUser = await user.create({
                    name: data.name,
                    age: data.age,
                    aadharNo: data.aadharNo,
                    gender: data.gender,
                    district:data.district,
                    constituency: data.constituency,
                    mobileNumber: data.mobileNumber,
                    email: data.email,
                    password: hashedPassword,
                    aadharImage: picdata.aadhar,
                    profileImage: picdata.profile,
                    userType: data.userType
                });
    
                return res.status(200).json({ message: 'Registered successfully', user: newUser });
            } else if (userType === 'admin') {
                const existingAdmin = await admin.findOne(search);
                if (existingAdmin) {
                    console.log("Admin exists");
                    return res.status(400).json({ error: 'Admin already exists with this Aadhar number' });
                }
    
                const hashedPassword = await bcrypt.hash(data.password, 10);
    
                console.log(picdata.aadhar)
                const newAdmin = await admin.create({
                    name: data.name,
                    age: data.age,
                    adminId: data.adminId,
                    aadharNo: data.aadharNo,
                    gender: data.gender,
                    district:data.district,
                    constituency: data.constituency,
                    mobileNumber: data.mobileNumber,
                    email: data.email,
                    password: hashedPassword,
                    aadharImage: picdata.aadhar, 
                    profileImage: picdata.profile,
                    userType: data.userType
                });
    
                return res.status(201).json({ message: 'Registered successfully', admin: newAdmin });
            }
        } catch (error) {
            console.error('Error registering user/admin:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        

    }
    else{
        res.send({message:"validation failed"})
    }    
});


module.exports = router;
