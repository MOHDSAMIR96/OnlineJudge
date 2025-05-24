import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/getLeaderboard`,
          {
            timeout: 10000,
          }
        );

        if (!response.data || !Array.isArray(response.data.leaderboard)) {
          throw new Error("Invalid data format received from server");
        }

        setLeaders(response.data.leaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);

        let errorMessage =
          "Failed to load leaderboard. Please try again later.";
        if (error.response) {
          errorMessage = error.response.data.error || error.response.statusText;
        } else if (error.request) {
          errorMessage =
            "No response from server. Please check your connection.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Error Loading Leaderboard
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Leaderboard
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Score</th>
                <th className="py-3 px-4 text-left">Solved</th>
                <th className="py-3 px-4 text-left">Efficiency</th>
                <th className="py-3 px-4 text-left">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaders.map((user, index) => (
                <tr
                  key={user.userId}
                  className={`${
                    index < 3 ? "bg-yellow-50" : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <td className="py-3 px-4 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 flex items-center gap-3">
                    {user.profilePic && (
                      <img
                        src={user.profilePic}
                        alt={user.firstname}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-profile.png";
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium">{user.firstname}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold">{user.score || 0}</td>
                  <td className="py-3 px-4">{user.solvedCount || 0}</td>
                  <td className="py-3 px-4">
                    {user.efficiency ? user.efficiency.toFixed(2) : "0.00"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {user.lastSubmission
                      ? new Date(user.lastSubmission).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
