const express = require('express');
const Project = require('../databasemodel/projectmodel/project');
const Sentiment =require('../databasemodel/projectmodel/sentiment')
const router = express.Router();

router.post('/projectadd', async (req, res) => {
  console.log(req.body.info)

  let data= req.body.info 
  console.log(data)
    try {
  
      
      const newProject = new Project({
        constituency:data.constituency,
        projectId:data.projectId,
        projectName:data.projectName,
        projectType:data.projectType,
        totalBudget:data.totalBudget,
        projectDetails:data.projectDescription
      });
  
      await newProject.save();

    return res.status(200).json({message:"Project added successfully"})
  
    } catch (error) {
      console.error('Error creating project:', error);
      return res.status(500).json(error)
    }
  });


router.post('/projectsentiment', async (req, res) => {
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


module.exports = router;
