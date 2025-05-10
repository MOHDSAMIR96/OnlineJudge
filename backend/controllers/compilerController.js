const Problem = require("../model/Problem");  
const TestCase = require("../model/TestCase");
const Submission = require("../model/Submission");
const Leaderboard = require("../model/Leaderboard");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { exec, execSync } = require("child_process");

exports.submitCode = async (req, res) => {
  const { language, code, problemId, userId } = req.body;

  try {
    // 1. Verify the problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ 
        error: "Problem not found",
        status: "ERROR" 
      });
    }

    // 2. Verify test cases exist
    if (!problem.testCases || problem.testCases.length === 0) {
      return res.status(400).json({ 
        error: "No test cases found for this problem",
        status: "ERROR" 
      });
    }

    // 3. Generate code file
    const filePath = await generateFile(language, code);

    const results = [];
    let verdict = "Accepted";
    let totalTestCases = problem.testCases.length;
    let passedTestCases = 0;
    let executionTime = 0; // Track total execution time
    let memoryUsed = 0; // Track memory usage

    // 4. Execute against each test case
    for (const testCase of problem.testCases) {
      const caseResult = {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        userOutput: "",
        passed: false,
        errorType: null,
        executionTime: 0,
        memoryUsage: 0
      };

      try {
        const inputFile = await generateInputFile(testCase.input);
        let userOutput;
        const startTime = process.hrtime();

        // Execute based on language
        if (language === "cpp") {
          userOutput = await executeCpp(filePath, inputFile);
        } else if (language === "java") {
          userOutput = await executeJava(filePath, inputFile);
        } else if (language === "python") {
          userOutput = await executePython(filePath, inputFile);
        }

        const diffTime = process.hrtime(startTime);
        caseResult.executionTime = diffTime[0] * 1000 + diffTime[1] / 1000000; // in ms
        executionTime += caseResult.executionTime;

        userOutput = userOutput.trim();
        caseResult.userOutput = userOutput;
        caseResult.passed = userOutput === testCase.expectedOutput.trim();

        if (caseResult.passed) {
          passedTestCases++;
        } else {
          verdict = "Wrong Answer";
        }
      } catch (err) {
        verdict = "Runtime Error";
        caseResult.errorType = "Runtime Error";
        caseResult.userOutput = err.error || err.stderr || "Runtime Error";
      }

      results.push(caseResult);
    }

    // Calculate average execution time and memory
    executionTime = executionTime / totalTestCases;

    // 5. Save submission
    const submission = new Submission({
      userId,
      problemId,
      language,
      code,
      verdict,
      executionTime,
      memoryUsed,
      testResults: results,
      timestamp: new Date()
    });

    await submission.save();

    // 6. Enhanced leaderboard update
    if (verdict === "Accepted") {
      const problemPoints = problem.difficulty === "hard" ? 20 : 
                          problem.difficulty === "medium" ? 15 : 10;
      
      await Leaderboard.findOneAndUpdate(
        { userId },
        { 
          $inc: { 
            score: problemPoints,
            solvedCount: 1,
            totalExecutionTime: executionTime
          },
          $addToSet: { solvedProblems: problemId },
          $min: { firstSolvedTimestamp: new Date() } // Track when they first solved it
        },
        { upsert: true, new: true }
      );
    } else {
      // Track failed attempts (for potential penalty or analytics)
      await Leaderboard.findOneAndUpdate(
        { userId },
        { $inc: { attemptedCount: 1 } },
        { upsert: true }
      );
    }

    // 7. Return response
    res.json({ 
      verdict,
      testResults: results,
      passedTestCases,
      totalTestCases,
      executionTime,
      memoryUsed,
      status: "SUCCESS" 
    });

  } catch (error) {
    console.error("Error in Submitting Code:", error);
    const message = error.error || error.stderr || error.message || "Internal Server Error";
    res.status(500).json({ 
      error: message, 
      status: "ERROR" 
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
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: 1,
          username: "$user.username",
          score: 1,
          solvedCount: 1,
          attemptedCount: 1,
          efficiency: {
            $cond: [
              { $eq: ["$attemptedCount", 0] },
              0,
              { $divide: ["$solvedCount", "$attemptedCount"] }
            ]
          }
        }
      },
      { $sort: { score: -1, solvedCount: -1, efficiency: -1 } },
      { $limit: 100 }
    ]);

    res.json({ 
      leaderboard,
      status: "SUCCESS" 
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ 
      error: "Failed to fetch leaderboard",
      status: "ERROR" 
    });
  }
};
// compilerController.js
exports.runCode = async (req, res) => {
  const { language, code, input } = req.body;

  try {
    // Generate file from code input
    const filePath = await generateFile(language, code);
    const inputFilePath = await generateInputFile(input || "");

    let output;
    if (language === "cpp") {
      output = await executeCpp(filePath, inputFilePath);
    } else if (language === "java") {
      output = await executeJava(filePath, inputFilePath);
    } else if (language === "python") {
      output = await executePython(filePath, inputFilePath);
    } else {
      return res.status(400).json({ error: "Unsupported language", status: "ERROR" });
    }

    // Return just the output for Run button
    res.json({ output, status: "SUCCESS" });
  } catch (error) {
    console.log("Error in Running Code", error);
    const message = error.error || error.stderr || "Internal Server Error";
    res.status(500).json({ error: message, status: "ERROR" });
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
    finalContent = content.replace(/public\s+class\s+\w+/, `public class ${className}`);
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
    execSync('g++ --version');
  } catch (err) {
    return Promise.reject({ error: 'C++ compiler not found. Please install g++ (MinGW) and add to PATH.' });
  }

  const outputDir = path.join(__dirname, "../outputs");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const jobId = path.basename(filePath).split(".")[0];
  const exePath = path.join(outputDir, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    const cmd = `g++ "${filePath}" -o "${exePath}" && "${exePath}" < "${inputFilePath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject({ error: 'Error during C++ compilation or execution.', stderr });
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
      if (error) return reject({ error: 'Error during Java compilation or execution.', stderr });
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
};

const executePython = (filePath, inputFilePath) => {
  try {
    execSync('python --version');
  } catch (err) {
    return Promise.reject({ error: 'Python interpreter not found. Please install Python and add to PATH.' });
  }

  return new Promise((resolve, reject) => {
    const cmd = `python "${filePath}" < "${inputFilePath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject({ error: 'Error during Python execution.', stderr });
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
};
