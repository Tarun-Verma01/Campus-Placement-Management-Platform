const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    studentEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId, //-> stores the mongodb id of the job
        required: true,
        ref: "Job"
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Applied"
    },
    statusHistory: {
        type: [{
            status: {
                type: String,
                required: true
            }
        }],
        default: []
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

applicationSchema.index({ studentEmail: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);