const Leaderboard = require("../model/Leaderboard");

// Create or update a leaderboard entry
exports.updateLeaderboard = async (req, res) => {
  const { userId, username, score } = req.body;

  if (!userId || !username || score == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let entry = await Leaderboard.findOne({ userId });

    if (entry) {
      entry.score = score;
      await entry.save();
    } else {
      entry = new Leaderboard({ userId, username, score });
      await entry.save();
    }

    res.status(201).json({ message: "Leaderboard updated successfully", entry });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    res.status(500).json({ error: "Failed to update leaderboard" });
  }
};

// Fetch top leaderboard entries
exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await Leaderboard.find()
      .sort({ score: -1 })
      .limit(50); // Top 50 users

    if (!topUsers || topUsers.length === 0) {
      return res.status(404).json({ error: "No leaderboard entries found" });
    }

    res.json({ topUsers });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
