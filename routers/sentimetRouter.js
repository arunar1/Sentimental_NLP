const express = require('express');
const { spawn } = require('child_process');

const router = express.Router();

router.post('/', (req, res) => {
    let value
    const inputData = req.body.text;

    const pythonProcess = spawn('poetry', ['run', 'python', './inference.py', inputData]);
    let output = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        console.log(output);
        if(output.trim()=='Positive'){
            value=1
        }
        else if(output.trim()=='Negative'){
            value=-1
        }

        res.send({status:'ok', sentiment: output.trim(),response:value });
    });
});

module.exports = router;
