const express = require('express');
const Project = require('../databasemodel/projectmodel/project');
const Sentiment =require('../databasemodel/projectmodel/sentiment')
const router = express.Router();

router.post('/projectadd', async (req, res) => {
    try {
      const { constituency, projectId, projectName, projectDetails } = req.body;
  
      
      const newProject = new project({
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
