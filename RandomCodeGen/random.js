let randomCode;

function generateRandomCode() {
    randomCode = Math.floor(100000 + Math.random() * 900000);
    console.log(randomCode);
}

function getRandomCode() {
    return randomCode;
}

module.exports = { generateRandomCode, getRandomCode };