import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProblemManager = () => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    input: "",
    output: "",
    testCases: "",
    topic: "",
    medium: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await axios.get("http://localhost:8000/problems");
      setProblems(response.data.problems);
    } catch (error) {
      console.error("Error fetching problems", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:8000/problem/${selectedProblem._id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:8000/problem", formData);
      }
      resetForm();
      fetchProblems();
    } catch (error) {
      console.error("Error saving problem", error);
    }
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setIsEditing(true);
    setFormData({ ...problem });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/problem/${id}`);
      fetchProblems();
    } catch (error) {
      console.error("Error deleting problem", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      input: "",
      output: "",
      testCases: "",
      topic: "",
      medium: "",
    });
    setIsEditing(false);
    setSelectedProblem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient flex items-center justify-center px-4 py-10">
      <div className="max-w-7xl w-full bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl p-10">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10 drop-shadow">
          Online Judge - Problem Manager
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Problem List */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Problems
            </h3>
            <div className="bg-gray-100 p-3 rounded-lg font-semibold text-gray-700 flex justify-between text-sm">
              <span className="w-1/4">Title</span>
              <span className="w-1/4 text-center">Topic</span>
              <span className="w-1/4 text-center">Medium</span>
              <span className="w-1/4 text-center">Actions</span>
            </div>

            <div className="space-y-3 mt-2 max-h-[500px] overflow-y-auto">
              {problems.length > 0 ? (
                problems.map((problem) => (
                  <div
                    key={problem._id}
                    className="flex justify-between items-center p-3 bg-gray-50 border rounded-md hover:bg-gray-100 transition-all"
                  >
                    <span className="w-1/4 truncate text-sm font-medium">{problem.title}</span>
                    <span className="w-1/4 text-center text-sm">{problem.topic}</span>
                    <span className="w-1/4 text-center text-sm">{problem.medium}</span>
                    <div className="w-1/4 flex justify-center space-x-4">
                      <button
                        onClick={() => handleSelectProblem(problem)}
                        className="text-yellow-500 hover:text-yellow-700"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(problem._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No problems found.</p>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              {isEditing ? "Edit Problem" : "Add Problem"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {["title", "description", "topic", "input", "output", "testCases"].map((field) => (
                <textarea
                  key={field}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                  required
                  rows={field === "description" ? 3 : 2}
                />
              ))}

              <select
                name="medium"
                value={formData.medium}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                required
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-green-700 transition-all"
              >
                {isEditing ? "Update Problem" : "Add Problem"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-gray-500 text-white py-3 rounded-md font-semibold text-lg hover:bg-gray-600 mt-2"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemManager;
