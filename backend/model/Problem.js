const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  input: {
    type: Array,
    required: true,
  },
  output: {
    type: Array,
    required: true,
  },
  testCases: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Problem", problemSchema);