const express = require('express');
const router = express.Router();
const Poll = require('../databasemodel/poll/poll')
const PollResult = require('../databasemodel/poll/pollResult')
const {today}=require('../module/data')

router.post('/addpoll', async (req, res) => {
    console.log(req.body)

    let constituency=''
    if(req.body.constituency!=''){
        constituency=req.body.constituency
    }
    else{
        constituency='nodata'
    }
    console.log(constituency)
    console.log(today)
    try {

        const newpoll = await Poll.create({
            description:req.body.description,
            constituency,
            date:today
        })
        
        
        res.status(200).json({ message: 'Poll added successfully' });
    } catch (error) {
        console.error('Error adding poll:', error);
        res.status(500).json({ error: 'Failed to add poll' });
    }
});



router.post('/addingpoll', async (req, res) => {
    const { description, district, constituency, aadhar, vote } = req.body;
    try {
        let existingPoll = await PollResult.findOne({ description, aadhar });

        if (existingPoll) {
            return res.status(200).json({ message: 'Already polled' });
        }

        let poll = new PollResult({ description, district, constituency, aadhar, vote });
        await poll.save();
        res.status(200).json({ message: 'Poll added successfully' });
    } catch (error) {
        console.error('Error adding poll:', error);
        res.status(500).json({ error: 'Failed to add poll' });
    }

});

router.post('/addingPollCheck',async(req,res )=>{
    console.log(req.body)
    const { description, aadhar} = req.body;
    let existingPoll = await PollResult.findOne({ description, aadhar });
    console.log(existingPoll)
    if(existingPoll){
        return res.status(200).json({flag:true})
    }
})

router.get('/getPollResult',async(req , res)=>{
    try {
        const pollResultRecords = await PollResult.find(); 

        return res.status(200).json({data:pollResultRecords})
    } catch (error) {
        
    }
})


router.get('/getpoll', async(req , res )=>{


    try {
        const pollRecords = await Poll.find(); 

     
        
        return res.status(200).json({data:pollRecords})
        
    } catch (error) {
        
    }
})







router.delete('/deletePoll', async (req, res) => {
    const { description } = req.body;

    console.log(description)

    try {
        const deletedPoll = await Poll.findOneAndDelete({ description });

        const deleteAllResult=await PollResult.deleteMany({description})

        console.log(deleteAllResult)

        if (!deletedPoll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        res.status(200).json({ message: 'Poll deleted successfully', deletedPoll });
    } catch (error) {
        console.error('Error deleting poll:', error);
        res.status(500).json({ error: 'Failed to delete poll' });
    }
});

module.exports = router;
