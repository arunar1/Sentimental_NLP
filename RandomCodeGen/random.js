let randomCode;

function generateRandomCode() {
    return new Promise((resolve, reject) => {
        let randomCode = Math.floor(100000 + Math.random() * 900000);
        console.log(randomCode);
        resolve(randomCode);
    });
}

function getRandomCode() {
    return randomCode;
}

module.exports = { generateRandomCode, getRandomCode };