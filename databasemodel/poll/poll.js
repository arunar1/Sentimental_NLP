const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        unique:true
    },
    constituency:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true,
    },
    district:{
        type:String,
        required:true
    }
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
