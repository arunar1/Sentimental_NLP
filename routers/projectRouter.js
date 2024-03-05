const express = require('express');
const Project = require('../databasemodel/projectmodel/project');
const Sentiment =require('../databasemodel/projectmodel/sentiment')
const router = express.Router();
const {getSentiment} =require('../nlp')
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
      return res.status(200).json({ error: 'An error occurred while adding the project' });

    }
  });


  router.post('/projectsentiment', async (req, res) => {
    try {
        const { projectId, sentimentData } = req.body;

        const value = getSentiment(sentimentData.sentiment);

        let sentiment;

        if (value == 0 || value == 1) {
            sentiment = 1;
        } else if (value == -1) {
            sentiment = 0;
        }

        console.log(sentiment);
        console.log(req.body);

        let existingProject = await Sentiment.findOne({ projectId });

        if (existingProject) {
            const existingSentiment = existingProject.sentimentData.find(data => data.aadharNo === sentimentData.aadharNo);
            if (existingSentiment) {
                return res.status(200).send({ message: 'Sentiment data with the same Aadhar number already exists for this project' });
            }
            existingProject.sentimentData.push({
                aadharNo: sentimentData.aadharNo,
                sentiment: sentimentData.sentiment,
                sentimentValue: sentiment
            });
            await existingProject.save();
            return res.status(200).json({ message: 'Sentiment data updated successfully' });
        } else {
            const newProjectSentiment = new Sentiment({
                projectId,
                sentimentData: [{
                    aadharNo: sentimentData.aadharNo,
                    sentiment: sentimentData.sentiment,
                    sentimentValue: sentiment
                }],
                constituency: req.body.constituency
            });
            await newProjectSentiment.save();
            return res.status(201).json({ message: 'Sentiment data added successfully' });
        }
    } catch (error) {
        console.error('Error adding/updating sentiment data:', error);
        if (error.code === 11000) { 
            return res.status(400).json({ error: 'Duplicate key error: Sentiment data with the same Aadhar number already exists for this project' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.post('/getByConstituency', async (req, res) => {
  try {
    const { constituency } = req.body;

    console.log(constituency)

    if (!constituency) {
      return res.status(400).json({ message: 'Constituency is required in the request body.' });
    }
    
    const projects = await Project.find({ constituency });

    if (projects.length === 0) {
      console.log("No project")
      return res.status(200).json({ message: 'No projects found for the specified constituency.' });
    }

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;
