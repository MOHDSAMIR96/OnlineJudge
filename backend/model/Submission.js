const mongoose = require("mongoose");

const TestResultSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  userOutput: String,
  passed: Boolean,
  errorType: String
}, { _id: false });

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  verdict: { type: String, required: true },
  testResults: [TestResultSchema]
}, { timestamps: true });

module.exports = mongoose.model("Submission", SubmissionSchema);