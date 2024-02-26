const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    constituency: { type: String, required: true },
  projectId: { type: Number, required: true, unique: true },
  projectName: { type: String, required: true },
  projectDetails: { type: String, required: true }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
