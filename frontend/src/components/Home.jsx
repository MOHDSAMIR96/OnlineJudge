import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const Home = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/problems");
        if (isMounted) {
          setProblems(response.data.problems);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setError("Failed to load problems. Please try again later.");
          console.error("Error fetching problems:", error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProblems();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSolveClick = (problemId) => {
    if (!problemId) {
      alert("Invalid problem ID");
      return;
    }

    // Check if user is logged in by trying to get the token
    const token = localStorage.getItem("token");
    console.log("token found in home page", token);

    if (token) {
      // User is logged in, navigate to problem page
      navigate(`/problem/${problemId}`);
    } else {
      // User not logged in, redirect to login with return URL
      navigate("/login", {
        state: {
          from: `/problem/${problemId}`,
          message: "Please login to solve this problem",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 animate-gradient flex items-center justify-center px-4">
      <main className="w-full max-w-5xl p-6 bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 drop-shadow-sm">
          🧠 Problem List
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-600">Loading problems...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 bg-gray-800 text-white py-3 px-5 rounded-t-xl font-semibold text-sm sm:text-base">
              <span className="text-left">Title</span>
              <span className="text-center hidden md:block">Topic</span>
              <span className="text-center hidden md:block">Medium</span>
              <span className="text-right">Solve</span>
            </div>

            <div className="divide-y divide-gray-300 bg-gray-50 rounded-b-xl">
              {problems.length > 0 ? (
                problems.map((problem, index) => (
                  <div
                    key={problem._id}
                    className={`grid grid-cols-1 md:grid-cols-4 py-4 px-5 text-gray-800 items-center text-sm sm:text-base transition-all ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    } hover:bg-blue-100`}
                  >
                    <span className="truncate font-medium">
                      {problem.title}
                    </span>
                    <span className="text-center hidden md:block">
                      {problem.topic || "N/A"}
                    </span>
                    <span className="text-center hidden md:block">
                      {problem.medium || "N/A"}
                    </span>
                    <button
                      onClick={() => handleSolveClick(problem._id)}
                      className="text-blue-600 font-semibold flex items-center justify-end hover:text-blue-800 transition"
                    >
                      Solve <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No problems found.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
