const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  minCGPA: { type: Number, required: true },
  branches: { type: [String], required: true },
  requiredSkills: { type: [String], default: [] },
  deadline: { type: Date, required: true },
});

module.exports = mongoose.model("Job", jobSchema);
