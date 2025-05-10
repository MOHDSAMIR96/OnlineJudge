const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  expectedOutput: { type: String, required: true },
  input: { type: String, required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }
}, { timestamps: true });

module.exports = mongoose.model('TestCase', TestCaseSchema);