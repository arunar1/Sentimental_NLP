const express = require('express');
const { spawn } = require('child_process');
const morgan = require('morgan');

const app = express();
const PORT = 3000; // You can change the port number as per your preference

// Use Morgan middleware for logging
app.use(morgan('dev'));
// Parse JSON bodies
app.use(express.json());

app.post('/api/sentiment', (req, res) => {
    const inputData = req.body.text;
    
    // Call Python script with input data as command-line argument
    const pythonProcess = spawn('python3', ['./inference.py', inputData]);

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
        res.json({ sentiment: output.split("\n")[0] });

    });
});

app.get('/user',(req,res)=>{
    res.send("Welcome")
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
