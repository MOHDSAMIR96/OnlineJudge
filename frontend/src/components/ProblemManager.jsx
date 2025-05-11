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
    testCases: [{ input: "", expectedOutput: "" }],
    topic: "",
    medium: "Easy", // Set default to Easy
    difficulty: "Easy", // Add difficulty field to match backend
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testCaseJson, setTestCaseJson] = useState(
    JSON.stringify([{ input: "", expectedOutput: "" }], null, 2)
  );

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/problems");
      setProblems(response.data.problems);
      setError("");
    } catch (error) {
      console.error("Error fetching problems", error);
      setError("Failed to fetch problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTestCaseChange = (e) => {
    const value = e.target.value;
    setTestCaseJson(value);

    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error("Test cases must be an array");
      }

      // Validate each test case
      const validatedCases = parsed.map((tc) => ({
        input: tc.input ? String(tc.input) : "",
        expectedOutput: tc.expectedOutput ? String(tc.expectedOutput) : "",
      }));

      setFormData((prev) => ({
        ...prev,
        testCases: validatedCases,
      }));
      setError("");
    } catch (err) {
      setError("Invalid JSON format for test cases");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");

      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.topic ||
        !formData.medium
      ) {
        throw new Error("All fields are required");
      }

      // Validate test cases
      if (
        formData.testCases.length === 0 ||
        formData.testCases.some((tc) => !tc.input || !tc.expectedOutput)
      ) {
        throw new Error(
          "All test cases must have both input and expected output"
        );
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        input: formData.input,
        output: formData.output,
        testCases: formData.testCases,
        topic: formData.topic,
        medium: formData.medium,
        difficulty: formData.medium, // Map medium to difficulty for backend
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:8000/problem/${selectedProblem._id}`,
          payload
        );
      } else {
        await axios.post("http://localhost:8000/problem", payload);
      }

      resetForm();
      fetchProblems();
    } catch (error) {
      console.error("Error saving problem", error);
      setError(
        error.response?.data?.error || error.message || "Failed to save problem"
      );
    }
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setIsEditing(true);
    const testCases = Array.isArray(problem.testCases)
      ? problem.testCases
      : typeof problem.testCases === "string"
      ? JSON.parse(problem.testCases)
      : [{ input: "", expectedOutput: "" }];

    setFormData({
      title: problem.title,
      description: problem.description,
      input: problem.input,
      output: problem.output,
      testCases: testCases,
      topic: problem.topic,
      medium: problem.difficulty || problem.medium || "Easy",
      difficulty: problem.difficulty || "Easy",
    });
    setTestCaseJson(JSON.stringify(testCases, null, 2));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;
    try {
      await axios.delete(`http://localhost:8000/problem/${id}`);
      fetchProblems();
    } catch (error) {
      console.error("Error deleting problem", error);
      setError("Failed to delete problem. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      input: "",
      output: "",
      testCases: [{ input: "", expectedOutput: "" }],
      topic: "",
      medium: "Easy",
      difficulty: "Easy",
    });
    setTestCaseJson(
      JSON.stringify([{ input: "", expectedOutput: "" }], null, 2)
    );
    setIsEditing(false);
    setSelectedProblem(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient flex items-center justify-center px-4 py-10">
      <div className="max-w-7xl w-full bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl p-10">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10 drop-shadow">
          Online Judge - Problem Manager
        </h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Problem List */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Problems
            </h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 p-3 rounded-lg font-semibold text-gray-700 flex justify-between text-sm">
                  <span className="w-1/4">Title</span>
                  <span className="w-1/4 text-center">Topic</span>
                  <span className="w-1/4 text-center">Difficulty</span>
                  <span className="w-1/4 text-center">Actions</span>
                </div>

                <div className="space-y-3 mt-2 max-h-[500px] overflow-y-auto">
                  {problems.length > 0 ? (
                    problems.map((problem) => (
                      <div
                        key={problem._id}
                        className="flex justify-between items-center p-3 bg-gray-50 border rounded-md hover:bg-gray-100 transition-all"
                      >
                        <span className="w-1/4 truncate text-sm font-medium">
                          {problem.title}
                        </span>
                        <span className="w-1/4 text-center text-sm">
                          {problem.topic}
                        </span>
                        <span className="w-1/4 text-center text-sm">
                          {problem.difficulty || problem.medium}
                        </span>
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
                    <p className="text-center text-gray-500 py-4">
                      No problems found.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              {isEditing ? "Edit Problem" : "Add Problem"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Input
                  </label>
                  <textarea
                    name="input"
                    value={formData.input}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Output
                  </label>
                  <textarea
                    name="output"
                    value={formData.output}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Cases (JSON array)*
                </label>
                <textarea
                  name="testCases"
                  value={testCaseJson}
                  onChange={handleTestCaseChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400 font-mono text-sm"
                  required
                  rows={6}
                  placeholder={`[\n  {\n    "input": "4\\n12345\\n3203\\n1000\\n57",\n    "expectedOutput": "54321\\n3023\\n1\\n75"\n  },\n  {\n    "input": "1\\n1000",\n    "expectedOutput": "1"\n  }\n]`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: Array of objects with "input" and "expectedOutput"
                  properties
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic*
                  </label>
                  <input
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty*
                  </label>
                  <select
                    name="medium"
                    value={formData.medium}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-400"
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-green-700 transition-all"
                >
                  {isEditing ? "Update Problem" : "Add Problem"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-md font-semibold text-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemManager;
