const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { exec, execSync } = require("child_process");
const Submission = require("../model/Submission");
const TestCase = require("../model/TestCase");

exports.runCode = async (req, res) => {
  const { language, code, input, problemId, userId } = req.body;

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

    let verdict = "Accepted";

    // Fetch test cases for the given problem
    const testCases = await TestCase.find({ problemId });

    // Iterate over the test cases to compare output
    for (const testCase of testCases) {
      console.log("controller",testCase);
      const inputFile = await generateInputFile(testCase.input);
      let expectedOutput = testCase.expectedOutput.trim();
      let userOutput;

      try {
        if (language === "cpp") userOutput = await executeCpp(filePath, inputFile);
        else if (language === "java") userOutput = await executeJava(filePath, inputFile);
        else if (language === "python") userOutput = await executePython(filePath, inputFile);
      } catch (err) {
        verdict = "Runtime Error";
        break;
      }

      console.log("Test Case Input:", testCase.input);
      console.log("Expected Output:", expectedOutput);
      console.log("User Output:", userOutput);

      // Check if the output matches the expected output
      if (userOutput.trim() !== expectedOutput) {
        verdict = "Wrong Answer";
        break;
      }
    }

    // Create a submission record
    const submission = new Submission({
      userId,
      problemId,
      language,
      code,
      input,
      output,
      verdict,
    });

    await submission.save();

    // Return the response
    res.json({ output, verdict, status: "SUCCESS" });
  } catch (error) {
    console.log("Error in Running Code", error);
    const message = error.error && typeof error.error === 'string' ? error.error : "Internal Server Error";
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
