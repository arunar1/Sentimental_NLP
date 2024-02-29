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

let randomCode
app.post('/verification', async (req, res) => {
    randomCode = Math.floor(100000 + Math.random() * 900000);
    console.log(randomCode)

    try {
        const data = req.body.info;

        const searchAadhar = { "aadharNo": data.aadharNo };
        const searchPhone = { "mobileNumber": data.mobileNumber };

        const userRecord = await user.findOne(searchAadhar);
        const adminRecord = await admin.findOne(searchAadhar);
        const userRecord1 = await user.findOne(searchPhone);
        const adminRecord1 = await admin.findOne(searchPhone);

        if (userRecord || adminRecord || userRecord1 || adminRecord1) {
            return res.status(200).send({ status: 200, message: "Account Already exists" });
        }

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
                return res.status(500).send({ status: "error", message: "Failed to send email" });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).send({ status: "ok", message: "Email is sent" });
            }
        });
    } catch (error) {
        console.error('Error in /verification endpoint:', error);
        return res.status(500).send({ status: "error", message: "Internal Server Error" });
    }
});


// Registration endpoint
app.post('/registration', async (req, res) => {
    const picdata = req.body;
    const data = req.body.info;

    console.log(data);
    console.log(picdata)
    
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
                    district:data.district,
                    constituency: data.constituency,
                    mobileNumber: data.mobileNumber,
                    email: data.email,
                    password: hashedPassword,
                    aadharImage: picdata.aadhar,
                    profileImage: picdata.profile,
                    userType: data.userType
                });
    
                return res.status(200).json({ message: 'User registered successfully', user: newUser });
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
    console.log(req.body)
    const { email, password } = req.body;
    const search = { "email": email };

    try {
        const userRecord = await user.findOne(search);
        const adminRecord = await admin.findOne(search);

        let foundUser = null;
        if (userRecord) {
            foundUser = adminRecord;
        } else if (adminRecord) {
            foundUser = userRecord;
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


app.post('/projectadd', async (req, res) => {
    try {
      const { constituency, projectId, projectName, projectDetails } = req.body;
  
      
      const newProject = new Project({
        constituency,
        projectId,
        projectName,
        projectDetails
      });
  
      await newProject.save();
  
      res.status(201).json({ message: 'Project created successfully' });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.post('/projectsentiment', async (req, res) => {
    try {
        const { projectId, sentimentData } = req.body;

        const existingProject = await Sentiment.findOne({ projectId });

        if (existingProject) {
           
            existingProject.sentimentData[req.body.aadharNo] = req.body.sentiment;
            await existingProject.save();
            res.status(200).json({ message: 'Sentiment data updated successfully' });
        } else {
            
            const newProjectSentiment = new Sentiment({
                projectId,
                sentimentData: { [req.body.aadharNo]: req.body.sentiment },
                constituency: existingProject.constituency 
            });
            await newProjectSentiment.save();
            res.status(201).json({ message: 'Sentiment data added successfully' });
        }
    } catch (error) {
        console.error('Error adding/updating sentiment data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
