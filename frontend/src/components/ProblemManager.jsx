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

  // Fetch all problems
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

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit (add or update)
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

  // Handle problem selection for editing
  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setIsEditing(true);
    setFormData({ ...problem });
  };

  // Handle delete problem
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/problem/${id}`);
      fetchProblems();
    } catch (error) {
      console.error("Error deleting problem", error);
    }
  };

  // Reset form
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
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        Online Judge - Problem Management
      </h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Problem List Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">Problem List</h3>
          <div className="bg-gray-300 p-3 rounded-lg font-semibold text-gray-700 flex justify-between">
            <span className="w-1/4">Title</span>
            <span className="w-1/4 text-center">Topic</span>
            <span className="w-1/4 text-center">Medium</span>
            <span className="w-1/4 text-center">Actions</span>
          </div>

          {problems.length > 0 ? (
            problems.map((problem) => (
              <div
                key={problem._id}
                className="flex justify-between items-center p-4 border-b bg-white hover:bg-gray-50 transition-all rounded-md shadow-sm mt-2"
              >
                <span className="w-1/4 font-medium text-gray-800">
                  {problem.title}
                </span>
                <span className="w-1/4 text-center text-gray-700">{problem.topic}</span>
                <span className="w-1/4 text-center text-gray-700">{problem.medium}</span>
                <div className="w-1/4 flex justify-center space-x-4">
                  <button
                    onClick={() => handleSelectProblem(problem)}
                    className="text-yellow-500 hover:text-yellow-700 transition-all"
                    title="Edit"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(problem._id)}
                    className="text-red-500 hover:text-red-700 transition-all"
                    title="Delete"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4">No problems found.</p>
          )}
        </div>

        {/* Add / Edit Form Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            {isEditing ? "Edit Problem" : "Add Problem"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              name="topic"
              placeholder="Topic (e.g. Arrays, Graphs)"
              value={formData.topic}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
            <select
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <textarea
              name="input"
              placeholder="Input Cases (one per line)"
              value={formData.input}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              name="output"
              placeholder="Output Cases (one per line)"
              value={formData.output}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              name="testCases"
              placeholder="Test Cases (one per line)"
              value={formData.testCases}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-md font-bold text-lg hover:bg-green-700 transition-all"
            >
              {isEditing ? "Update Problem" : "Add Problem"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-gray-500 text-white py-3 rounded-md font-bold text-lg hover:bg-gray-600 transition-all mt-2"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProblemManager;