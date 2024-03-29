const express = require('express');
const nodemailer = require('nodemailer');
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');
const bcrypt = require('bcryptjs');

const { generateRandomCode } = require('../RandomCodeGen/random');
const { getRandomCode } = require('../RandomCodeGen/random');

const router = express.Router();

const validAdminIds = ['abc123', 'def456', 'ghi789']; 


router.post('/', async (req, res) => {
    try {
        const data = req.body.info;
        console.log(data);

        if(data.userType=='admin'){
            if(!validAdminIds.includes(data.adminId)){
                return res.status(200).send({ status: 200, message: "Admin Id invalid" });

            }
        }

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail.com$/;
        if (!gmailRegex.test(data.email)) {
            console.log("hello")
            res.send({message:"Provide a valid email"});
            return
            // return res.status(400).send({ status: 400, message: "Invalid Gmail address" });
        }

        const searchAadhar = { "aadharNo": data.aadharNo };
        const searchPhone = { "mobileNumber": data.mobileNumber };
        const searchGmail={"email":data.email};
        const searchConstituency={"constituency":data.constituency}

        const userRecord = await user.findOne(searchAadhar);
        const adminRecord = await admin.findOne(searchAadhar);
        const userRecord1 = await user.findOne(searchPhone);
        const adminRecord1 = await admin.findOne(searchPhone);
        const userRecord_2 = await user.findOne(searchGmail);
        const adminRecord_2 = await admin.findOne(searchGmail);
        const adminRecord_3 = await admin.findOne(searchConstituency);


        console.log(req.body.aadhar)

        if (userRecord || adminRecord ) {
            return res.status(200).send({ status: 200, message: "Adhaar Already exists" });
        }
        if( userRecord1 || adminRecord1){
            return res.status(200).send({ status: 200, message: "Mobile Number Already exists" });
        }
        if(userRecord_2 || adminRecord_2){
            return res.status(200).send({ status: 200, message: "Mail Id Already exists" });
    
        }
        if(!req.body.aadhar && !req.body.profile){
            return res.status(200).send({ status: 200, message: "file uploading failed" });

        }
        if(req.body.userType=='admin' && adminRecord_3){
            return res.status(200).send({ status: 200, message: "Constituency Duplication select the correct one" });

        }

        const randomCode = await generateRandomCode();
        console.log(randomCode);

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
                return res.status(200).send({ status: "ok", message: "Email sent" });
            }
        });
    } catch (error) {
        console.error('Error in /verification endpoint:', error);
        return res.status(500).send({ status: "error", message: "Internal Server Error" });
    }
});


router.post('/forgotpass',async(req , res )=>{
    const data= req.body;

    console.log(data)

    const searchGmail={"email":data.email};


    const userRecord_2 = await user.findOne(searchGmail);
    const adminRecord_2 = await admin.findOne(searchGmail);


    if(userRecord_2 || adminRecord_2){
        try {
            const randomCode = await generateRandomCode();
        console.log(randomCode);

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
            subject: 'Forgot Password Verification Code',
            text: `Your verification code is: ${randomCode}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).send({ status: "error", message: "Failed to send email" });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).send({ status: "ok", message: "Email sent" });
            }
        });
            
        } catch (error) {
            
        }
        
    }
    else{
        return res.status(200).send({ status: "error", message: "Failed to send email" });

    }

})


router.post('/forgotpassverify',async(req , res)=>{

    const code = req.body.verificationCode;


    console.log(code)

    let randomCode= await getRandomCode();

    console.log(randomCode)

    if(code==randomCode){
        return res.status(200).send({message:"code accepted"})
    }
    else{
        return res.status(200).send({message:"not code accepted"})
    }

})


router.put('/updatepass', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let foundUser = await user.findOne({ email });
        if (!foundUser) {
            foundUser = await admin.findOne({ email });
        }

        if (foundUser) {
            await foundUser.updateOne({ password: hashedPassword });
            res.status(200).json({ message: "Password updated successfully" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
