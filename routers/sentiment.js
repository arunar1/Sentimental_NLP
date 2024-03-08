const express =require('express')

const router =express.Router();

const {getSentiment} =require('../nlp')


router.post('/', (req , res )=>{
    const text=req.body.text;

    const value=getSentiment(text)

    console.log(value)

    let sentiment

    if(value==0 || value==1){
        sentiment="Positive"
    }
    else if(value==-1){
        sentiment="Nagative"
    }
   
    res.send({status:"ok",response:value, sentiment:sentiment})
})

module.exports =router;