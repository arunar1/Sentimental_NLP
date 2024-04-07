const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        unique:true
    },
    constituency:{
        type:String,
    },
    date:{
        type:String,
        required:true
    }
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
