const Leaderboard = require("../model/Leaderboard");
const User = require("../model/User");
const Problem = require("../model/Problem");

// Constants
const POINTS_PER_PROBLEM = 10;

// Update leaderboard when a problem is solved
exports.updateLeaderboard = async (req, res) => {
  try {
    const { userId, problemId } = req.body;
    
    // Verify user exists and get their details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Verify problem exists and get its difficulty
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    // Calculate score based on difficulty
    let scoreToAdd = POINTS_PER_PROBLEM;
    if (problem.difficulty === "hard") scoreToAdd = 20;
    else if (problem.difficulty === "medium") scoreToAdd = 15;

    const update = {
      $inc: { 
        score: scoreToAdd,
        solvedCount: 1
      },
      $addToSet: { solvedProblems: {
        problemId: problem._id,
        solvedAt: new Date(),
        pointsEarned: scoreToAdd
      }},
      $set: { 
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profilePic: user.profilePic,
        lastSubmission: new Date() 
      },
      $setOnInsert: {
        attemptedCount: 0,
        totalExecutionTime: 0,
        efficiency: 0
      }
    };

    const updatedEntry = await Leaderboard.findOneAndUpdate(
      { userId },
      update,
      { upsert: true, new: true, runValidators: true }
    );
    
    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: 1,
          // Use leaderboard fields first, fall back to user fields if null
          firstname: { $ifNull: ["$firstname", "$user.firstname"] },
          lastname: { $ifNull: ["$lastname", "$user.lastname"] },
          email: { $ifNull: ["$email", "$user.email"] },
          profilePic: { $ifNull: ["$profilePic", "$user.profilePic"] },
          score: 1,
          solvedCount: 1,
          attemptedCount: 1,
          efficiency: 1,
          totalExecutionTime: 1,
          lastSubmission: 1,
          // Create fullName field
          fullName: {
            $cond: {
              if: { $and: [
                { $ifNull: ["$firstname", "$user.firstname"] },
                { $ifNull: ["$lastname", "$user.lastname"] }
              ]},
              then: { $concat: [
                { $ifNull: ["$firstname", "$user.firstname"] },
                " ",
                { $ifNull: ["$lastname", "$user.lastname"] }
              ]},
              else: { $ifNull: ["$firstname", "$user.firstname"] }
            }
          }
        }
      },
      { 
        $sort: { 
          score: -1,
          solvedCount: -1,
          efficiency: -1,
          totalExecutionTime: 1
        } 
      },
      { $limit: 100 }
    ]);

    // Add ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json({ 
      success: true,
      leaderboard: rankedLeaderboard,
      status: "SUCCESS" 
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch leaderboard",
      status: "ERROR" 
    });
  }
};