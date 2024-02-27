const express = require('express');
const { spawn } = require('child_process');
const morgan = require('morgan');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.jwt_code;

const app = express();
const PORT = 4000;

const mongoose = require('mongoose');
const mongourl = process.env.mong_url;

mongoose.connect(`${mongourl}=true&w=majority&appName=politiscan`, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4000',
}));

const user = require('./databasemodel/registrationmodel/usermodel');
const admin = require('./databasemodel/registrationmodel/admin');

// API endpoint to handle sentiment analysis
app.post('/api/sentiment', (req, res) => {
    const inputData = req.body.text;
    console.log(inputData);

    const pythonProcess = spawn('poetry', ['run', 'python', './inference.py', inputData]);
    let output = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        console.log(output);
        return res.send({ sentiment: output.trim() });
    });
});



// verification of register

const randomCode = Math.floor(100000 + Math.random() * 900000);

app.post('/verification', (req , res )=>{
    const data = req.body.info;

    console.log(data)

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.forwardemail.net",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });

    var mailOptions = {
        from: process.env.EMAIL,
        to: data.email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${randomCode}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.send({status:"ok"})

});

// Registration endpoint
app.post('/registration', async (req, res) => {
    const picdata = req.body;
    const data = req.body.info;
    
    const userType = data.userType;
    const code = req.body.verificationCode;
    const search = { "aadharNo": data.aadharNo };

    console.log(code)

    console.log(randomCode)
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
                    constituency: data.constituency,
                    mobileNumber: data.mobileNumber,
                    email: data.email,
                    password: hashedPassword,
                    aadharImage: picdata.aadhar,
                    profileImage: picdata.profile,
                    userType: data.userType
                });
    
                return res.status(201).json({ message: 'User registered successfully', user: newUser });
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
                    constituency: data.constituency,
                    mobileNumber: data.mobileNumber,
                    email: data.email,
                    password: hashedPassword,
                    aadharImage: picdata.aadhar, // Ensure this field is provided
                    profileImage: picdata.profile,
                    userType: data.userType
                });
    
                return res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
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

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const search = { "email": email };

    try {
        const userRecord = await user.findOne(search);
        const adminRecord = await admin.findOne(search);

        let foundUser = null;
        if (userRecord) {
            foundUser = userRecord;
        } else if (adminRecord) {
            foundUser = adminRecord;
        } else {
            return res.json({ error: "User not available" });
        }

        if (await bcrypt.compare(password, foundUser.password)) {
            const token = jwt.sign({ email: foundUser.email }, JWT_SECRET);
            return res.status(201).json({ status: 'ok', token: token, details: foundUser });
        } else {
            return res.json({ status: 'error', error: "Invalid password" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Welcome endpoint
app.get('/user', (req, res) => {
    res.send("Welcome");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
