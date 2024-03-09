const express = require('express');
const Project = require('../databasemodel/projectmodel/project');
const Sentiment =require('../databasemodel/projectmodel/sentiment')
const router = express.Router();
const {getSentiment} =require('../nlp')
const sentimentAnalysis = require('../sentimentAnalysis');


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

  router.post('/projectSentimentCheck', async (req, res)=>{
    const { projectId, sentimentData } = req.body;

    let existingProject = await Sentiment.findOne({ projectId });

    if (existingProject) {
      const existingSentiment = existingProject.sentimentData.find(data => data.aadharNo === sentimentData.aadharNo);
      if (existingSentiment) {
          return res.status(202).send({ message: 'Already Feedback added', details:existingSentiment });
      }
  }


  })




  router.post('/projectsentiment', async (req, res) => {
    try {
        const { projectId, sentimentData } = req.body;

        const value = getSentiment(sentimentData.sentiment);


        
        console.log(value)

        

        let sentiment;

        if (value === 0 || value === 1) {
            sentiment = 1;
        } else if (value === -1) {
            sentiment = 0;
        }

        let existingProject = await Sentiment.findOne({ projectId });

        if (existingProject) {
            const existingSentiment = existingProject.sentimentData.find(data => data.aadharNo === sentimentData.aadharNo);
            if (existingSentiment) {
                return res.status(202).send({ message: 'Sentiment data with the same Aadhar number already exists for this project' });
            }
        }

        const newSentimentData = {
            aadharNo: sentimentData.aadharNo,
            sentiment: sentimentData.sentiment,
            sentimentValue: sentiment
        };

        if (existingProject) {
            existingProject.sentimentData.push(newSentimentData);
            await existingProject.save();
            return res.status(200).json({ message: 'Feedback added successfully' });
        } else {
            const newProjectSentiment = new Sentiment({
                projectId,
                sentimentData: [newSentimentData],
                constituency: req.body.constituency
            });
            await newProjectSentiment.save();
            return res.status(201).json({ message: 'Feedback added successfully' });
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



router.post('/sentimentResult', async (req, res) => {
  try {
    const { projectId } = req.body;

    console.log(projectId)


    const sentimentData = await Sentiment.find({ projectId });
    console.log(sentimentData[0])
    res.status(200).json(sentimentData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/allsentimentResult', async (req, res) => {
  try {
    const { constituency } = req.body;

    console.log(req.body)


    const sentimentData = await Sentiment.find({ constituency });
    console.log(sentimentData)
    res.status(200).json(sentimentData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/getProjectByCode', async (req , res)=>{
  try {
    console.log(req.body)
    projectId =req.body.code
    const projects = await Project.find({ projectId });

    return res.status(200).json(projects)

    
  } catch (error) {
    
  }
})



module.exports = router;
