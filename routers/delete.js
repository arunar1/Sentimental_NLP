const express = require('express');
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');
const router = express.Router(); // Create an instance of the router

router.delete('/deleteaccount', async ( req , res ) => {
    console.log(req.body);
    

    const {email,userType}=req.body

   try {
    if(userType=='admin'){
        const deleteAdmin= await admin.deleteOne({email})
        return res.status(200).send({message:'deleted',deleted:deleteAdmin})
    }
    else if(userType=='user'){
        const deleteUser=await user.deleteOne({email})
        return res.status(200).send({message:'deleted',deleted:deleteUser})
    }
    
   } catch (error) {
    return res.status(500).send({message:'error.... please try again'})
   }


});

module.exports = router;
