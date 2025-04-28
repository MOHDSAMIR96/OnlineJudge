const TestCase = require("../model/TestCase");

exports.createTestCase = async (req, res) => {
  const { problemId, input, expectedOutput, isSample } = req.body;

  try {
    const testCase = new TestCase({
      problemId,
      input,
      expectedOutput,
      isSample,
    });

    await testCase.save();
    res.status(201).json({ message: "Test case created successfully", testCase });
  } catch (error) {
    console.error("Error in saving test case:", error);
    res.status(500).json({ error: "Failed to create test case" });
  }
};

exports.getTestCasesForProblem = async (req, res) => {
  const { problemId } = req.params; // problemId passed as URL parameter

  try {
    const testCases = await TestCase.find({ problemId });

    if (!testCases || testCases.length === 0) {
      return res.status(404).json({ error: "No test cases found for this problem" });
    }

    res.json({ testCases });
  } catch (error) {
    console.error("Error fetching test cases:", error);
    res.status(500).json({ error: "Failed to fetch test cases" });
  }
};
