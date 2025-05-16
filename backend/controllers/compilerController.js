const Problem = require("../model/Problem");
const Submission = require("../model/Submission");
const Leaderboard = require("../model/Leaderboard");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { exec, execSync } = require("child_process");

exports.submitCode = async (req, res) => {
  const { language, code, problemId, userId, customInput } = req.body;

  try {
    // Verify the problem exists if problemId is provided
    let problem = null;
    if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({
          error: "Problem not found",
          status: "ERROR",
        });
      }
    }

    // Generate code file
    const filePath = await generateFile(language, code);

    const results = [];
    let verdict = "Accepted";
    let totalTestCases = 0;
    let passedTestCases = 0;
    let executionTime = 0;

    try {
      let inputToUse = "";
      let expectedOutputs = [];
      let testCaseInputs = [];

      if (problem) {
        // Use problem's test cases if available, otherwise use the sample input/output from problem
        if (problem.testCases && problem.testCases.length > 0) {
          testCaseInputs = problem.testCases.map((tc) => tc.input);
          expectedOutputs = problem.testCases.map((tc) => tc.expectedOutput);
        } else if (problem.input && problem.output) {
          // Parse the sample input/output from problem statement
          const inputLines = problem.input.split("\n");
          const outputLines = problem.output.split("\n");

          // First line is number of test cases
          const numTestCases = parseInt(inputLines[0]);

          // Extract test cases (skip first line)
          testCaseInputs = inputLines.slice(1, numTestCases + 1);
          expectedOutputs = outputLines.slice(0, numTestCases);
        }

        totalTestCases = testCaseInputs.length;
        inputToUse = `${totalTestCases}\n${testCaseInputs.join("\n")}`;
      } else if (customInput) {
        // Use custom input (single test case)
        totalTestCases = 1;
        inputToUse = `1\n${customInput}`;
        expectedOutputs = [""]; // No expected output for custom input
      } else {
        return res.status(400).json({
          error: "No test cases or custom input provided",
          status: "ERROR",
        });
      }

      const inputFile = await generateInputFile(inputToUse);
      let userOutput;
      const startTime = process.hrtime();

      // Execute based on language
      if (language === "cpp") {
        userOutput = await executeCpp(filePath, inputFile);
      } else if (language === "java") {
        userOutput = await executeJava(filePath, inputFile);
      } else if (language === "python") {
        userOutput = await executePython(filePath, inputFile);
      } else {
        return res.status(400).json({
          error: "Unsupported language",
          status: "ERROR",
        });
      }

      const diffTime = process.hrtime(startTime);
      executionTime = diffTime[0] * 1000 + diffTime[1] / 1000000;

      // Split output by lines and trim each line
      const outputLines = userOutput
        .trim()
        .split("\n")
        .map((line) => line.trim());

      // Verify each test case if we have expected outputs
      for (let i = 0; i < totalTestCases; i++) {
        const caseResult = {
          input: problem ? testCaseInputs[i] : customInput,
          expectedOutput: problem ? expectedOutputs[i] : "N/A (Custom Input)",
          userOutput: outputLines[i] || "",
          passed: false,
          errorType: null,
          executionTime: executionTime / totalTestCases,
        };

        if (problem) {
          caseResult.passed =
            caseResult.userOutput === caseResult.expectedOutput;
          if (caseResult.passed) {
            passedTestCases++;
          } else {
            verdict = "Wrong Answer";
          }
        } else {
          // For custom input, just show the output without verification
          caseResult.passed = true;
          passedTestCases++;
        }

        results.push(caseResult);
      }
    } catch (err) {
      verdict = "Runtime Error";
      const errorMessage = err.error || err.stderr || "Runtime Error";
      results.push({
        input: problem
          ? testCaseInputs[0] || problem.input.split("\n")[1]
          : customInput || "N/A",
        expectedOutput: problem
          ? expectedOutputs[0] || problem.output.split("\n")[0]
          : "N/A",
        userOutput: errorMessage,
        passed: false,
        errorType: "Runtime Error",
        executionTime: 0,
      });
    }

    // 3. Save submission if it's for a problem (not custom input)
    if (problemId) {
      const submission = new Submission({
        userId,
        problemId,
        language,
        code,
        verdict,
        executionTime,
        testResults: results,
        timestamp: new Date(),
      });

      await submission.save();

      // Update leaderboard
      const updateData = {
        $inc: {
          attemptedCount: 1,
          totalExecutionTime: executionTime,
        },
        $set: {
          lastSubmission: new Date(),
        },
      };

      if (verdict === "Accepted") {
        const problemPoints =
          problem.difficulty === "hard"
            ? 20
            : problem.difficulty === "medium"
            ? 15
            : 10;

        updateData.$inc.score = problemPoints;
        updateData.$inc.solvedCount = 1;
        updateData.$addToSet = {
          solvedProblems: {
            problemId: problem._id,
            solvedAt: new Date(),
            pointsEarned: problemPoints,
          },
        };
        updateData.$min = { firstSolvedTimestamp: new Date() };
      }

      await Leaderboard.findOneAndUpdate({ userId }, updateData, {
        upsert: true,
        new: true,
      });
    }

    // 5. Return response
    res.json({
      verdict,
      testResults: results,
      passedTestCases,
      totalTestCases,
      executionTime,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error in Submitting Code:", error);
    const message =
      error.error || error.stderr || error.message || "Internal Server Error";
    res.status(500).json({
      error: message,
      status: "ERROR",
    });
  }
};

// New function to get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: 1,
          firstname:"user.firstname",
          lastname: "$user.lastname",
          score: 1,
          solvedCount: 1,
          attemptedCount: 1,
          efficiency: {
            $cond: [
              { $eq: ["$attemptedCount", 0] },
              0,
              { $divide: ["$solvedCount", "$attemptedCount"] },
            ],
          },
        },
      },
      { $sort: { score: -1, solvedCount: -1, efficiency: -1 } },
      { $limit: 100 },
    ]);

    res.json({
      leaderboard,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      error: "Failed to fetch leaderboard",
      status: "ERROR",
    });
  }
};
// online comipler code
exports.runCode = async (req, res) => {
  const { language, code, input } = req.body;

  try {
    // Check if input is provided
    if (input === undefined || input === null) {
      return res.status(400).json({
        error: "Input is missing",
        status: "ERROR",
      });
    }

    // Generate file from code input
    const filePath = await generateFile(language, code);
    const inputFilePath = await generateInputFile(input || ""); // Handle empty string case

    let output;
    if (language === "cpp") {
      output = await executeCpp(filePath, inputFilePath);
    } else if (language === "java") {
      output = await executeJava(filePath, inputFilePath);
    } else if (language === "python") {
      output = await executePython(filePath, inputFilePath);
    } else {
      return res.status(400).json({
        error: "Unsupported language",
        status: "ERROR",
      });
    }

    // Return just the output for Run button
    res.json({
      output,
      status: "SUCCESS",
    });
  } catch (error) {
    console.log("Error in Running Code", error);
    const message = error.error || error.stderr || "Internal Server Error";
    res.status(500).json({
      error: message,
      status: "ERROR",
    });
  }
};

// Helper functions for file generation
const generateFile = async (format, content) => {
  const dirCodes = path.join(__dirname, "../codes");
  if (!fs.existsSync(dirCodes)) fs.mkdirSync(dirCodes);

  const rawId = uuidv4();
  const cleanId = rawId.replace(/-/g, "");
  let fileName;
  let finalContent = content;

  if (format === "java") {
    const className = `Main_${cleanId}`;
    fileName = `${className}.java`;
    finalContent = content.replace(
      /public\s+class\s+\w+/,
      `public class ${className}`
    );
  } else if (format === "python") {
    fileName = `${cleanId}.py`;
  } else {
    fileName = `${cleanId}.${format}`;
  }

  const filePath = path.join(dirCodes, fileName);
  fs.writeFileSync(filePath, finalContent);
  return filePath;
};

const generateInputFile = async (input) => {
  const dirInputs = path.join(__dirname, "../inputs");
  if (!fs.existsSync(dirInputs)) fs.mkdirSync(dirInputs, { recursive: true });

  const inputId = uuidv4();
  const inputFileName = `${inputId}.txt`;
  const inputFilePath = path.join(dirInputs, inputFileName);
  fs.writeFileSync(inputFilePath, input);
  return inputFilePath;
};

// Execute functions for different languages
const executeCpp = (filePath, inputFilePath) => {
  try {
    execSync("g++ --version");
  } catch (err) {
    return Promise.reject({
      error:
        "C++ compiler not found. Please install g++ (MinGW) and add to PATH.",
    });
  }

  const outputDir = path.join(__dirname, "../outputs");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const jobId = path.basename(filePath).split(".")[0];
  const exePath = path.join(outputDir, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    const cmd = `g++ "${filePath}" -o "${exePath}" && "${exePath}" < "${inputFilePath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error)
        return reject({
          error: "Error during C++ compilation or execution.",
          stderr,
        });
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
};

const executeJava = (filePath, inputFilePath) => {
  const dirCodes = path.dirname(filePath);
  const className = path.basename(filePath, ".java");

  return new Promise((resolve, reject) => {
    const compileCmd = `javac "${filePath}"`;
    const runCmd = `java -cp "${dirCodes}" ${className} < "${inputFilePath}"`;
    exec(`${compileCmd} && ${runCmd}`, (error, stdout, stderr) => {
      if (error)
        return reject({
          error: "Error during Java compilation or execution.",
          stderr,
        });
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
};

const executePython = (filePath, inputFilePath) => {
  try {
    execSync("python --version");
  } catch (err) {
    return Promise.reject({
      error:
        "Python interpreter not found. Please install Python and add to PATH.",
    });
  }

  return new Promise((resolve, reject) => {
    const cmd = `python "${filePath}" < "${inputFilePath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error)
        return reject({ error: "Error during Python execution.", stderr });
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
};
