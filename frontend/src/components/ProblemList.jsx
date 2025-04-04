import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa"; // Import arrow icon

const ProblemList = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get("http://localhost:8000/problems");
        setProblems(response.data.problems);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Problem List</h2>

      {/* Table Header */}
      <div className="grid grid-cols-4 bg-gray-800 text-white py-3 px-5 rounded-t-lg font-semibold">
        <span className="text-left">Title</span>
        <span className="text-center">Topic</span>
        <span className="text-center">Medium</span>
        <span className="text-right">Solve</span>
      </div>

      {/* Problem Rows */}
      <div className="divide-y divide-gray-300 bg-gray-50 rounded-b-lg">
        {problems.map((problem, index) => (
          <div 
            key={problem._id} 
            className={`grid grid-cols-4 py-4 px-5 text-gray-700 items-center transition ${
              index % 2 === 0 ? "bg-white" : "bg-gray-100"
            } hover:bg-gray-200`}
          >
            <span className="truncate font-medium">{problem.title}</span>
            <span className="text-center">{problem.topic || "N/A"}</span>
            <span className="text-center">{problem.medium || "N/A"}</span>
            <Link to={`/problem/${problem._id}`} className="text-blue-600 font-semibold flex items-center justify-end hover:text-blue-800 transition">
              Solve <FaArrowRight className="ml-2" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemList;
