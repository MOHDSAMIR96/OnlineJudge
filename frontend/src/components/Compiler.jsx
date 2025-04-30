import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "../Compiler.css"; // Custom CSS for background animation

const Compiler = ({ userId }) => {
  const { id: problemId } = useParams();
  const location = useLocation();
  const showProblemDetails = location.state?.fromSolve;

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/problem/${problemId}`);
        if (res.data?.problem) {
          const problemData = res.data.problem;
          if (typeof problemData.testCases === "string") {
            problemData.testCases = JSON.parse(`[${problemData.testCases}]`);
          }
          setProblem(problemData);
        }
      } catch (err) {
        console.error("Failed to load problem:", err);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    setCode(getDefaultCode(language));
    setOutput("");
    setVerdict("");
  }, [language]);

  const getDefaultCode = (lang) => {
    switch (lang) {
      case "cpp":
        return `#include <iostream>\nusing namespace std;\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << a + b;\n  return 0;\n}`;
      case "java":
        return `import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}`;
      case "python":
        return `a = int(input())\nb = int(input())\nprint(a + b)`;
      default:
        return "";
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRun = async () => {
    try {
      const { data } = await axios.post("http://localhost:8000/run", {
        language,
        code,
        input,
      });
      setOutput(data.output);
    } catch (error) {
      setOutput(error?.response?.data?.error || "Something went wrong");
    }
  };

  const handleSubmit = async () => {
    if (!problem?.testCases?.length) {
      setVerdict("No Test Cases Found");
      return;
    }

    try {
      let allPassed = true;

      for (let testCase of problem.testCases) {
        const payload = {
          language,
          code,
          input: Array.isArray(testCase.input) ? testCase.input.join("\n") : testCase.input,
          problemId,
          userId,
        };

        const { data } = await axios.post("http://localhost:8000/run", payload);

        const normalize = (str) => str.replace(/\s+$/gm, "").trim();

        if (normalize(data.output) !== normalize(testCase.output)) {
          allPassed = false;
          break;
        }
      }

      setVerdict(allPassed ? "Accepted" : "Wrong Answer");
      await saveSubmission(allPassed);
    } catch (error) {
      setVerdict(error?.response?.data?.error || "Something went wrong");
      setOutput("");
    }
  };

  const saveSubmission = async (allPassed) => {
    try {
      await axios.post("http://localhost:8000/submit", {
        userId,
        problemId,
        language,
        code,
        input,
        output,
        verdict: allPassed ? "Accepted" : "Wrong Answer",
      });
    } catch (error) {
      console.error("Error saving submission:", error);
    }
  };

  const mapLanguageToMonaco = (lang) => {
    return lang === "cpp" ? "cpp" : lang;
  };

  return (
    <div className="compiler-bg min-h-screen py-10 px-6">
      <div className="container mx-auto flex flex-col lg:flex-row gap-6">
        {/* LEFT PANEL */}
        {showProblemDetails && problem && (
          <div className="lg:w-1/2 bg-white rounded-xl shadow-md p-6 h-fit max-h-[85vh] overflow-y-auto problem-details">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">{problem.title}</h1>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-6">{problem.description}</p>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Sample Input</h2>
            <pre className="bg-gray-100 p-3 rounded mb-4">{problem.input}</pre>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Sample Output</h2>
            <pre className="bg-gray-100 p-3 rounded">{problem.output}</pre>
          </div>
        )}

        {/* RIGHT PANEL */}
        <div className="lg:w-1/2 flex flex-col space-y-4">
          <div>
            <label className="block font-medium text-sm mb-1">Language</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="border rounded p-2"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="editor-container rounded shadow-md overflow-hidden" style={{ height: "300px" }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={mapLanguageToMonaco(language)}
              value={code}
              onChange={(newValue) => setCode(newValue)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Custom Input</label>
            <textarea
              rows="5"
              className="w-full p-3 rounded bg-black text-green-400 font-mono"
              placeholder="Enter input here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleRun}
              className="flex-1 py-2 rounded text-white font-semibold bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
            >
              Run ▶
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 rounded text-white font-semibold bg-red-500 hover:bg-red-600"
            >
              Submit 🚀
            </button>
          </div>

          {output && (
            <div className="bg-gray-900 text-white p-4 rounded-md output-container">
              <h3 className="font-bold mb-2">Console Output</h3>
              <pre className="text-sm font-mono whitespace-pre-wrap">{output}</pre>
            </div>
          )}

          {verdict && (
            <div className={`text-sm font-semibold mt-2 ${verdict === "Accepted" ? "text-green-600" : "text-red-600"}`}>
              Verdict: <span className="px-2 py-1 rounded bg-white">{verdict}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compiler;
