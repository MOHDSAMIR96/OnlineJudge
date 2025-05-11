const mongoose = require("mongoose");

const TestCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
  },
  { _id: false }
);

const ProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    input: { type: String, required: true },
    output: { type: String, required: true },
    testCases: [TestCaseSchema],
    topic: { type: String, required: true },
    medium: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", ProblemSchema);
