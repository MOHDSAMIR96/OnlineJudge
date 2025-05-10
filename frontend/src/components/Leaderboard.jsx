import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:8000/getLeaderboard', {
          timeout: 10000
        });
        
        if (!data.success) {
          throw new Error(data.error || "Invalid data received");
        }
        
        setLeaders(data.leaderboard || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setError(error.response?.data?.error || 
                error.message || 
                "Failed to load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Leaderboard</h1>
        
        {error ? (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Score</th>
                  <th className="py-3 px-4 text-left">Solved</th>
                  <th className="py-3 px-4 text-left">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaders.map((user, index) => (
                  <tr key={user._id} className={`${index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="py-3 px-4 font-medium">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      {user.profilePic && (
                        <img 
                          src={user.profilePic} 
                          alt={user.firstname}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/default-profile.png';
                          }}
                        />
                      )}
                      <span>{user.firstname}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{user.score}</td>
                    <td className="py-3 px-4">{user.solvedCount}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(user.lastSubmission).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;