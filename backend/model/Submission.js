const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  input: {
    type: String,
  },
  output: {
    type: String,
  },
  verdict: {
    type: String, // Example: "Accepted", "Wrong Answer", "Compilation Error", "Runtime Error"
    default: "Pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  executionTime: {
    type: String, // Optional: "0.23s", "1.01s", etc.
  },
  memoryUsed: {
    type: String, // Optional: "25MB", etc.
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
