let randomCode;

function generateRandomCode() {
    return new Promise((resolve, reject) => {
        randomCode = Math.floor(100000 + Math.random() * 900000);
        console.log(randomCode);
        resolve(randomCode);
    });
}

function getRandomCode() {
    return new Promise((resolve, reject) => {
        if (randomCode) {
            resolve(randomCode);
        } else {
            reject(new Error('Random code has not been generated yet.'));
        }
    });
}

module.exports = { generateRandomCode, getRandomCode };
