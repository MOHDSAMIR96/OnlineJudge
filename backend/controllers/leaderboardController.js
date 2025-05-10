const Leaderboard = require("../model/Leaderboard");
const User = require("../model/User");

// Update leaderboard when a problem is solved
exports.updateLeaderboard = async (req, res) => {
  try {
    const { userId, problemId, scoreToAdd = 10 } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const update = {
      $inc: { score: scoreToAdd },
      $addToSet: { solvedProblems: problemId },
      $set: { 
        firstname: user.firstname,
        lastSubmission: new Date() 
      }
    };

    const updatedEntry = await Leaderboard.findOneAndUpdate(
      { userId },
      update,
      { upsert: true, new: true }
    );
    
    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get sorted leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await Leaderboard.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          userId: 1,
          firstname: '$userDetails.firstname',
          score: 1,
          solvedCount: { $size: '$solvedProblems' },
          lastSubmission: 1,
          profilePic: '$userDetails.profilePic'
        }
      },
      { $sort: { score: -1 } },
      { $limit: 50 }
    ]);

    res.json({ 
      success: true,
      leaderboard: topUsers 
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch leaderboard" 
    });
  }
};