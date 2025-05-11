const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      default: null,
    },
    lastname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
    solvedCount: {
      type: Number,
      default: 0,
    },
    attemptedCount: {
      type: Number,
      default: 0,
    },
    solvedProblems: [
      {
        problemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Problem",
        },
        solvedAt: {
          type: Date,
          default: Date.now,
        },
        pointsEarned: {
          type: Number,
          default: 10,
        },
      },
    ],
    totalExecutionTime: {
      type: Number,
      default: 0,
    },
    firstSolvedTimestamp: {
      type: Date,
    },
    lastSubmission: {
      type: Date,
      default: Date.now,
    },
    efficiency: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate efficiency before saving
leaderboardSchema.pre("save", function (next) {
  this.efficiency =
    this.attemptedCount > 0 ? this.solvedCount / this.attemptedCount : 0;
  next();
});

// Indexes for better performance
leaderboardSchema.index({ score: -1 });
leaderboardSchema.index({ solvedCount: -1 });
leaderboardSchema.index({ efficiency: -1 });

// Virtual for full name (using firstname/lastname from user model)
leaderboardSchema.virtual("fullName").get(function () {
  return `${this.firstname || ""} ${this.lastname || ""}`.trim();
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
