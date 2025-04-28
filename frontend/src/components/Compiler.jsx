import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const Compiler = ({ userId }) => {
  const { id: problemId } = useParams();
  const location = useLocation();
  const showProblemDetails = location.state?.fromSolve;

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/problem/${problemId}`);
        console.log("data........",res.data);
        console.log("testcases........",res.data.problem.testCases);
        if (res.data?.problem) {
          const problemData = res.data.problem;

        // If testCases is a stringified JSON, parse it into an array
        if (typeof problemData.testCases === 'string') {
          problemData.testCases = JSON.parse(`[${problemData.testCases}]`); // This will parse the string into an array of objects
        }
        console.log("test221122......",problemData.testCases)
          setProblem(problemData);
          setCode(getDefaultCode(language));
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      }
    };
    fetchProblem();
  }, [problemId, language]);

  const getDefaultCode = (lang) => {
    switch (lang) {
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << a + b;\n  return 0;\n}`;
      case 'java':
        return `import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}`;
      case 'python':
        return `a = int(input())\nb = int(input())\nprint(a + b)`;
      default:
        return '';
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(getDefaultCode(selectedLang));
    setOutput('');
    setVerdict('');
  };

  const handleRun = async () => {
    const payload = { language, code, input }; // User-provided input
    try {
      const { data } = await axios.post("http://localhost:8000/run", payload);
      setOutput(data.output);
    } catch (error) {
      setOutput(error?.response?.data?.error || 'Something went wrong');
    }
  };

  const handleSubmit = async () => {
    if (!problem?.testCases?.length) {
      setVerdict('No Test Cases Found');
      return;
    }

    try {
      let allPassed = true;
    console.log("test111111111ewwe",problem.testCases);
      // Loop through all test cases from problem
      for (let testCase of problemData.testCases) {
        const payload = {
          language,
          code,
          input: Array.isArray(testCase.input) ? testCase.input.join('\n') : testCase.input,
          problemId, 
          userId,
        };
        console.log("test input .....",payload);
        const { data } = await axios.post("http://localhost:8000/run", payload);
        const userOutput = data.output?.trim();
        const expectedOutput = testCase.output?.trim();

        // Normalize (remove extra spaces, line endings)
        const normalize = (str) => str.replace(/\s+$/gm, '').trim();

        if (normalize(userOutput) !== normalize(expectedOutput)) {
          allPassed = false;  // If any test case fails, stop
          break;
        }
      }

      // Final verdict after all test cases
      setVerdict(allPassed ? 'Accepted' : 'Wrong Answer');

      // Save the submission with result
      await saveSubmission(allPassed);

    } catch (error) {
      setVerdict(error?.response?.data?.error || 'Something went wrong');
      setOutput('');
    }
  };

  const saveSubmission = async (allPassed) => {
    const payload = {
      userId,
      problemId,
      language,
      code,
      input,
      output,
      verdict: allPassed ? 'Accepted' : 'Wrong Answer',
    };

    try {
      await axios.post("http://localhost:8000/submit", payload);
    } catch (error) {
      console.error('Error submitting solution:', error);
    }
  };

  const mapLanguageToMonaco = (lang) => {
    switch (lang) {
      case 'cpp':
        return 'cpp';
      case 'java':
        return 'java';
      case 'python':
        return 'python';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col lg:flex-row items-stretch">
      {/* LEFT PANEL */}
      <div className="lg:w-1/2 lg:pr-4 mb-4 lg:mb-0">
        {showProblemDetails && problem && (
          <>
            <h1 className="text-3xl font-bold mb-3">{problem.title}</h1>
            <div className="mb-4 text-gray-700 bg-gray-50 p-4 rounded shadow-sm max-h-[400px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">Problem Description</h2>
              <pre className="text-sm whitespace-pre-wrap">{problem.description}</pre>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:w-1/2 lg:pl-8 flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="border border-gray-300 px-2 py-1 rounded-sm"
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div style={{ height: '300px', background: '#0d1117' }} className="rounded-md shadow-md">
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

        {/* Input Area for Run */}
        <div>
          <label className="block text-sm font-medium mb-1">Custom Input (for Run only)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-sm px-2 py-1"
            rows={4}
            placeholder="Enter input here..."
          ></textarea>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleRun}
            type="button"
            className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 rounded-md"
          >
            Run ▶
          </button>

          <button
            onClick={handleSubmit}
            type="button"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
          >
            Submit 🚀
          </button>
        </div>

        {output && (
          <div className="bg-gray-900 text-white rounded-md p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-2">Console Output</h2>
            <div
              className="whitespace-pre-wrap text-sm"
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                minHeight: '80px',
              }}
            >
              {output}
            </div>
          </div>
        )}

        {verdict && (
          <div className="mt-2 text-sm font-semibold">
            Verdict:{' '}
            <span
              className={`px-2 py-1 rounded ${
                verdict === 'Accepted'
                  ? 'bg-green-300 text-green-900'
                  : 'bg-red-300 text-red-900'
              }`}
            >
              {verdict}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compiler;
