const express = require('express');
const nodemailer = require('nodemailer');
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');

const {generateRandomCode} =require('../RandomCodeGen/random')

const router = express.Router();


router.post('/', async (req, res) => {
    let randomCode

    setTimeout(()=>{
         randomCode= generateRandomCode()
    },100)

    console.log(randomCode)

    try {
        const data = req.body.info;
        console.log(data)

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

module.exports = router;
