const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
 userId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "user",
     required: true,
   },
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
