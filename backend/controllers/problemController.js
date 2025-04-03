const Problem = require("../model/Problem");

// Add Problem Controller
exports.addProblem = async (req, res) => {
  try {
    const { title, description, input, output, testCases, topic, medium } = req.body;

    if (!title || !description || !input || !output || !testCases || !topic || !medium) {
      return res.status(422).json({ error: "All input fields are required!" });
    }

    const problem = await Problem.create({
      title,
      description,
      input,
      output,
      testCases,
      topic,
      medium,
    });

    res.status(201).json({ message: "Problem added successfully", status: true, problem });
  } catch (error) {
    console.error("Error in Add Problem:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Edit Problem Controller
exports.editProblem = async (req, res) => {
  try {
    const { title, description, input, output, testCases, topic, medium } = req.body;
    const { id } = req.params;

    if (!title || !description || !input || !output || !testCases || !topic || !medium) {
      return res.status(422).json({ error: "All input fields are required!" });
    }

    const problem = await Problem.findByIdAndUpdate(
      id,
      { title, description, input, output, testCases, topic, medium },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json({ message: "Problem edited successfully", status: true, problem });
  } catch (error) {
    console.error("Error in Edit Problem:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Single Problem Controller
exports.getSingleProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json({ problem });
  } catch (error) {
    console.error("Error in Get Single Problem:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Problems Controller
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.status(200).json({ problems });
  } catch (error) {
    console.error("Error in Get All Problems:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete Problem Controller
exports.deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json({ message: "Problem deleted successfully", status: true });
  } catch (error) {
    console.error("Error in Delete Problem:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
