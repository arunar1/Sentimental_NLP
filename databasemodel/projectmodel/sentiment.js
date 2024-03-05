const mongoose = require('mongoose');

const sentimentSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    sentimentData: [
        {
            aadharNo: { type: Number, required: true },
            sentiment: { type: String, required: true },
            sentimentValue: { type: Number, required: true }
        }
    ],
    constituency: { type: String, required: true }
});

sentimentSchema.index({ 'projectId': 1, 'sentimentData.aadharNo': 1 }, { unique: true });

const Sentiment = mongoose.model('Sentiment', sentimentSchema);

module.exports = Sentiment;
