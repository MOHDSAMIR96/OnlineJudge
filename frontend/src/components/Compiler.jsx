import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "../Compiler.css";

const Compiler = ({ userId }) => {
  const { id: problemId } = useParams();
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [compilationError, setCompilationError] = useState("");
  const [activeTab, setActiveTab] = useState("testcase");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const fetchProblem = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/problem/${problemId}`);
      if (res.data?.problem) {
        const problemData = res.data.problem;
        if (
          problemData.testCases &&
          typeof problemData.testCases === "string"
        ) {
          try {
            problemData.testCases = JSON.parse(problemData.testCases);
          } catch (err) {
            console.error("Failed to parse test cases:", err);
            problemData.testCases = [];
          }
        } else if (!Array.isArray(problemData.testCases)) {
          problemData.testCases = [];
        }
        setProblem(problemData);
      }
    } catch (err) {
      console.error("Failed to load problem:", err);
    } finally {
      setLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  const getDefaultCode = useCallback(
    (lang) => {
      if (!problem) return "";

      const templates = {
        cpp: `#include <iostream>
using namespace std;

int main() {
  // Your code here
  // Read input from cin
  // Write output to cout
  return 0;
}`,
        java: `import java.util.*;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    // Your code here
    // Read input using sc.nextInt(), sc.next(), etc.
    // Write output using System.out.println()
  }
}`,
        python: `# Your code here
# Read input using input()
# Write output using print()`,
      };

      return templates[lang] || "";
    },
    [problem]
  );

  useEffect(() => {
    setCode(getDefaultCode(language));
    setOutput("");
    setVerdict("");
    setTestResults([]);
    setCompilationError("");
    setActiveTab("testcase");
  }, [language, problem, getDefaultCode]);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("Error: Code cannot be empty");
      return;
    }

    try {
      setIsRunning(true);
      setVerdict("");
      setCompilationError("");
      setActiveTab("result");

      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, {
        language,
        code,
        input,
      });

      if (data.error) {
        setOutput(data.error);
        setCompilationError(data.error);
        setVerdict("Runtime Error");
      } else {
        setOutput(data.output || "No output");
        setVerdict("Executed Successfully");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || "Execution failed";
      setOutput(`Error: ${errorMsg}`);
      setVerdict("Runtime Error");
      console.error("Execution error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput("Error: Code cannot be empty");
      return;
    }

    if (!userId) {
      setOutput("Error: Please login to submit your code");
      setVerdict("Authentication Required");
      return;
    }

    try {
      setIsSubmitting(true);
      setOutput("");
      setVerdict("Running...");
      setTestResults([]);
      setCompilationError("");
      setActiveTab("result");

      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/submit`, {
        language,
        code,
        problemId,
        userId,
      });

      if (data.error) {
        setVerdict("Error");
        setOutput(data.error);
      } else {
        setVerdict(data.verdict || "No verdict");
        const results = Array.isArray(data.testResults) ? data.testResults : [];
        setTestResults(results);

        if (data.verdict === "Accepted") {
          setOutput(`All test cases passed! 🎉`);
        } else {
          const firstFailure = results.find((r) => !r.passed);
          if (firstFailure) {
            setOutput(
              `Test Case Failed:\nInput: ${
                firstFailure.input || ""
              }\nExpected: ${firstFailure.expectedOutput || ""}\nGot: ${
                firstFailure.userOutput || ""
              }`
            );
          }
        }
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || "Submission failed";
      setVerdict("Error");
      setOutput(`Error: ${errorMsg}`);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!problem) {
    return <div className="text-center py-8">Problem not found</div>;
  }

  return (
    <div className="compiler-container">
      <div className="problem-section">
        <h1 className="problem-title">{problem.title}</h1>
        <div className="problem-description">
          <div dangerouslySetInnerHTML={{ __html: problem.description }} />
        </div>

        <div className="tabs">
          <button
            className={activeTab === "testcase" ? "active" : ""}
            onClick={() => setActiveTab("testcase")}
          >
            Test Cases
          </button>
          <button
            className={activeTab === "result" ? "active" : ""}
            onClick={() => setActiveTab("result")}
          >
            Results
          </button>
        </div>

        {activeTab === "testcase" && (
          <div className="test-cases">
            <h3>Sample Test Cases</h3>
            <div className="input">
              <h4>Input:</h4>
              <pre>{problem.input}</pre>
            </div>
            <div className="output">
              <h4>Expected Output:</h4>
              <pre>{problem.output}</pre>
            </div>
          </div>
        )}

        {activeTab === "result" && (
          <div className="results">
            {verdict && (
              <div
                className={`verdict ${
                  verdict.toLowerCase().includes("accept") ? "success" : "error"
                }`}
              >
                {verdict}
              </div>
            )}
            {output && (
              <div className="output-container">
                <h4>Output:</h4>
                <pre>{output}</pre>
              </div>
            )}
            {testResults.length > 0 && (
              <div className="test-results">
                <h4>Test Results:</h4>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`test-result ${
                      result.passed ? "passed" : "failed"
                    }`}
                  >
                    <div>
                      Test Case {index + 1}:{" "}
                      {result.passed ? "✓ Passed" : "✗ Failed"}
                    </div>
                    {!result.passed && (
                      <>
                        <div>Input: {result.input}</div>
                        <div>Expected: {result.expectedOutput}</div>
                        <div>Got: {result.userOutput}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="editor-section">
        <div className="editor-header">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isSubmitting || isRunning}
          >
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>
        </div>

        <Editor
          height="400px"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: isSubmitting || isRunning,
          }}
        />

        <div className="editor-footer">
          <div className="custom-input-toggle">
            <button onClick={toggleCustomInput}>
              {showCustomInput ? "Hide Custom Input" : "▼ Custom Input"}
            </button>
          </div>

          {showCustomInput && (
            <div className="custom-input">
              <h4>Custom Input</h4>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSubmitting || isRunning}
                placeholder="Enter custom input here"
              />
            </div>
          )}

          <div className="buttons">
            <button
              onClick={handleRun}
              disabled={isSubmitting || isRunning}
              className={isRunning ? "running" : ""}
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isRunning}
              className={isSubmitting ? "submitting" : ""}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;
