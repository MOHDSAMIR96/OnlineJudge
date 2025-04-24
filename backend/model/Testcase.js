const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  input: {
    type: String,
  },
  expectedOutput: {
    type: String,
  },
  isSample: {
    type: Boolean,
    default: false, // true for sample testcases shown to users, false for hidden testcases
  },
});

module.exports = mongoose.model("TestCase", testCaseSchema);
