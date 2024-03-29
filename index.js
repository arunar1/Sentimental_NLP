const express = require('express');
const morgan = require('morgan');
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 4000;

const sentimentRouter = require('./routers/sentimetRouter');
const verificationRouter = require('./routers/verificationRouter');
const registrationRouter = require('./routers/registrationRouter');
const loginRouter = require('./routers/loginRouter');
const projectRouter = require('./routers/projectRouter');
const sentiment =require('./routers/sentiment')
const  addPoll=require('./routers/addPoll')
const deleteAccount=require('./routers/delete')

const {sentimentValue}=require('./sentimentValue')

const mongoose = require('mongoose');
const mongourl = process.env.mong_url;

mongoose.connect(`${mongourl}=true&w=majority&appName=politiscan`, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4000',
}));

app.use('/api/sentiment', sentimentRouter);
app.use('/verification', verificationRouter);
app.use('/registration', registrationRouter);
app.use('/login', loginRouter);
app.use('/project', projectRouter);
app.use('/getsentiment',sentiment)
app.use('/',addPoll);
app.use('/delete',deleteAccount)


app.use('/checksentiment',async(req ,res )=>{
    let text=req.body.text

    let score=await sentimentValue(text)

    return  res.send({value:score})
})


app.get('/user', (req, res) => {
    res.send("Welcome");
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
