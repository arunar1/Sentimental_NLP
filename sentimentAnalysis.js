const { spawn } = require('child_process');

const sentimentAnalysis = (inputData) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('poetry', ['run', 'python', './inference.py', inputData]);
        let output = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
            reject('Internal Server Error');
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python script exited with code ${code}`);
            console.log(output);
            let sentiment;
            let response;
            if (output.trim() === 'Positive') {
                sentiment = 'Positive';
                response = 1;
            } else if (output.trim() === 'Negative') {
                sentiment = 'Negative';
                response = 0;
            } else {
                sentiment = output.trim();
                response = 1;
            }

            resolve(response);
        });
    });
};

module.exports = sentimentAnalysis;
