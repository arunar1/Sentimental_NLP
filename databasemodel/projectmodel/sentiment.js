const mongoose = require('mongoose');

const sentimentSchema = new mongoose.Schema({
    projectId: { type: Number, required: true, unique: true },
    sentimentData: [
        {
            aadharNo: { type: Number, required: true },
            sentiment: { type: String, required: true }
        }
    ],
    constituency: { type: String, required: true }
});

const Sentiment = mongoose.model('Sentiment', sentimentSchema);

module.exports = Sentiment;
