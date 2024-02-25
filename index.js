const express = require('express');
const { spawn } = require('child_process');
const morgan = require('morgan');
const cors = require("cors");
const bodyParser = require('body-parser');



const app = express();
const PORT =4000; // You can change the port number as per your preference

// Use Morgan middleware for logging
app.use(morgan('dev'));
// Parse JSON bodies
app.use(express.json());
// app.use(bodyParser.json());


app.use(
    cors({
        origin: 'http://localhost:4000',
    })
  );

app.post('/api/sentiment', (req, res) => {
    // console.log(req)

    const inputData = req.body.text;
    
    console.log(inputData)

    // Call Python script with input data as command-line argument
    const pythonProcess = spawn('poetry', ['run','python','./inference.py', inputData]);

    let output = '';

    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Handle error event
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    // Send output back to client once Python script execution is completed
    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        console.log(output)
        return res.send({ sentiment: output.trim() });

        // res.json({ sentiment: output.trim() });
        // res.send(output)

    });
});

app.post('/registration', (req, res) => {
    console.log(req.body)
    res.send('POST request to /registration');
});



app.get('/user',(req,res)=>{
    res.send("Welcome")
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
