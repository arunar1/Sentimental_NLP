const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        unique:true
    }
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
