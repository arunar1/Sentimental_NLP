const mongoose = require('mongoose')

const sentimentSchema = new mongoose.Schema({
    projectId: { type: Number, required: true, unique: true },
    aadharNo:{type:Number,required:true,unique:true},
    constituency: { type: String, required: true },
    sentiment:{type:String, required:true}

})

const Sentiment = mongoose.model('Project', sentimentSchema);

module.exports = Sentiment;