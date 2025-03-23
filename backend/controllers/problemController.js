const Problem = require("../model/Problem");

// add problem controller
exports.addProblem = async (req, res) => {
  try {
    const { title, description, input, output, testCases } = req.body;

    if (!title || !description || !input || !output || !testCases) {
      return res.status(422).json({ error: "All input fields are required!" });
    }

    const problem = await Problem.create({
      title,
      description,
      input,
      output,
      testCases,
    });

    res
      .status(201)
      .json({ message: "Problem added successfully", status: true, problem });
  } catch (error) {
    console.log("Error in Add Problem", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// edit problem controller
exports.editProblem = async (req, res) => {
  try {
    const { title, description, input, output, testCases } = req.body;
    const { id } = req.params;

    if (!title || !description || !input || !output || !testCases) {
      return res.status(422).json({ error: "All input fields are required!" });
    }

    const problem = await Problem.findByIdAndUpdate(
      id,
      {
        title,
        description,
        input,
        output,
        testCases,
      },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Problem edited successfully", status: true, problem });
  } catch (error) {
    console.log("Error in Edit Problem", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSingleProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json({ problem });
  } catch (error) {
    console.log("Error in Get Single Problem", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.status(200).json({ problems });
  } catch (error) {
    console.log("Error in Get All Problems", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};