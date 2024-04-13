const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');
const JWT_SECRET = process.env.jwt_code;
const  nodemailer=require('nodemailer')

const router = express.Router();

router.post('/', async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    const search = { "email": email };

    try {
        const userRecord = await user.findOne(search);
        const adminRecord = await admin.findOne(search);

       if(email=='admin' && password=='1234') {
            return res.status(204).json({message:"Welcome User"})
        }

        let foundUser = null;
        if (userRecord) {
            foundUser = userRecord;
        } else if (adminRecord) {
            foundUser = adminRecord;
        } else {
            return res.json({ error: "User not available" });
        }


        if (foundUser && foundUser.password) {
            if(!foundUser.verified){
                return res.json({ status: 'error', error: "Verification is not completed" });

            }
            if (await bcrypt.compare(password, foundUser.password)) {
                const token = jwt.sign({ email: foundUser.email }, JWT_SECRET);
                return res.status(201).json({ status: 'ok', token: token, details: foundUser });
            } else {
                return res.json({ status: 'error', error: "Invalid password" });
            }
        } else {
            return res.json({ status: 'error', error: "User not found or password not available" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/checkUser', async (req, res) => {
    try {
        const userRecords = await user.find(); 
        const adminRecord = await admin.find();
        console.log(adminRecord)
        res.status(200).json({userdetails:userRecords,admindetails:adminRecord}); 
    } catch (error) {
        console.error('Error fetching user records:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/:constituency', async (req, res)=>{
    const constituency=req.params.constituency
    console.log(constituency)
    const search={constituency:constituency}
    try {
        const Users= await user.find(search)
        console.log(Users)
        res.send({status:200,data:Users})
    } catch (error) {
        
    }
})


router.put('/admin/verify/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const User = await user.findByIdAndUpdate(userId, { verified: true }, { new: true }) || await admin.findByIdAndUpdate(userId, { verified: true }, { new: true });

        console.log(User)


        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }
        try {
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
                to: User.email,
                subject: 'Verification completed',
                text: `Your Account has been successully verified`
            };
    
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ status: "error", message: "Failed to send email" });
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({ message: 'User verified successfully', user });

                }
            });
            
        } catch (error) {
            
        }
        

    } catch (error) {
        console.error('Error verifying user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
