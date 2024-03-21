const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  constituency: { type: String, required: true},
  projectId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  projectType: { type: String, required: true },
  totalBudget: { type: Number, required: true },
  projectDetails: { type: String, required: true },
  Date: { type: String, required: true }
});

projectSchema.index({ projectName: 1, constituency: 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
