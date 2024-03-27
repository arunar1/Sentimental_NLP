const express = require('express');
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');
const router = express.Router(); // Create an instance of the router
const nodemailer = require('nodemailer');

router.delete('/deleteaccount', async ( req , res ) => {
    console.log(req.body);
    

    const {email,userType}=req.body

   try {
    if(userType=='admin'){
        const deleteAdmin= await admin.deleteOne({email})
        if(deleteAdmin){
            try {
                
                
            } catch (error) {
                
            }
            return res.status(200).send({message:'deleted',deleted:deleteAdmin})
            
        }
        
    }
    else if(userType=='user'){
        const deleteUser=await user.deleteOne({email})
        console.log(deleteUser)
        if(deleteUser){
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
                    to: email,
                    subject: 'Deletion',
                    text: `Your Account deleted successfully`
                };
        
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        return res.status(500).send({ status: "error", message: "Failed to send email" });
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(200).send({message:'deleted',deleted:deleteUser})


                        // return res.status(200).send({ status: "ok", message: "Email sent" });
                    }

                });
                
            } catch (error) {
                
            }
        }
        
    }
    
    
   } catch (error) {
    return res.status(500).send({message:'error.... please try again'})
   }


});

router.delete('/deleteaccountbyadmin', async ( req , res ) => {
    console.log(req.body);
    

    const {email,userType}=req.body

   try {
    if(userType=='admin'){
        const deleteAdmin= await admin.deleteOne({email})
        if(deleteAdmin){
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
                    to: email,
                    subject: 'Rejection',
                    text: `Your verification cannot be completed and registration rejected`
                };
        
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        return res.status(500).send({ status: "error", message: "Failed to send email" });
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(200).send({message:'deleted',deleted:deleteAdmin})

                        // return res.status(200).send({ status: "ok", message: "Email sent" });
                    }
                });

                
                
            } catch (error) {
                
            }
            return res.status(200).send({message:'deleted',deleted:deleteAdmin})
            
        }
        
    }
    else if(userType=='user'){
        const deleteUser=await user.deleteOne({email})
        console.log(deleteUser)
        if(deleteUser){
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
                    to: email,
                    subject: 'Rejection',
                    text: `Your verification cannot be completed and registration rejected`
                };
        
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        return res.status(500).send({ status: "error", message: "Failed to send email" });
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(200).send({message:'deleted',deleted:deleteUser})

                        // return res.status(200).send({ status: "ok", message: "Email sent" });
                    }
                });
                
            } catch (error) {
                
            }
            
        }
        
    }
    
    
   } catch (error) {
    return res.status(500).send({message:'error.... please try again'})
   }


});

module.exports = router;
