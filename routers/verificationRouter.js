const express = require('express');
const nodemailer = require('nodemailer');
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');

const { generateRandomCode } = require('../RandomCodeGen/random');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const data = req.body.info;
        console.log(data);

        if(data.userType=='admin'){
            if(data.adminId!='abcd'){
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

        const userRecord = await user.findOne(searchAadhar);
        const adminRecord = await admin.findOne(searchAadhar);
        const userRecord1 = await user.findOne(searchPhone);
        const adminRecord1 = await admin.findOne(searchPhone);
        const userRecord_2 = await user.findOne(searchGmail);
        const adminRecord_2 = await admin.findOne(searchGmail);

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

module.exports = router;
