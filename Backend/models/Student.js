const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    cgpa: {
        type: Number,
        required: true
    },
    skills: {
        type: [String],
        default: []
    },
    blocked: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Student", studentSchema);