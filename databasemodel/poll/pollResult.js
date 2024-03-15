const mongoose = require('mongoose');

const pollResultSchema = new mongoose.Schema({
    description: { type: String },
    district: String,
    constituency: String,
    aadhar: { type: Number },
    vote: {
        type: String,
        enum: ['yes', 'no']
    }
});

pollResultSchema.index({ description: 1, aadhar: 1 }, { unique: true });

const PollResult = mongoose.model('PollResult', pollResultSchema);

module.exports = PollResult;
