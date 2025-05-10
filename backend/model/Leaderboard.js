const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  firstname: { 
    type: String, 
    required: true 
  },
  score: { 
    type: Number, 
    default: 0 
  },
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  lastSubmission: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);