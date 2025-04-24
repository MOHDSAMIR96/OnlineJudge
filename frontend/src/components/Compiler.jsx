import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import axios from 'axios';
import '../App.css';

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
        if (res.data?.problem) {
          setProblem(res.data.problem);
          setCode(getDefaultCode(language));
        } else {
          console.warn("No problem data found.");
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      }
    };
    fetchProblem();
  }, [problemId, language]);

  const getHighlightedCode = (code) => {
    switch (language) {
      case 'cpp':
        return Prism.highlight(code, Prism.languages.clike, 'clike');
      case 'java':
        return Prism.highlight(code, Prism.languages.java, 'java');
      case 'python':
        return Prism.highlight(code, Prism.languages.python, 'python');
      default:
        return code;
    }
  };

  const getDefaultCode = (lang) => {
    switch (lang) {
      case 'cpp': return `#include <iostream>\nusing namespace std;\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << a + b;\n  return 0;\n}`;
      case 'java': return `import java.util.*;\nclass Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}`;
      case 'python': return `a = int(input())\nb = int(input())\nprint(a + b)`;
      default: return '';
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(getDefaultCode(selectedLang));
    setOutput('');
    setVerdict('');
  };

  const handleSubmit = async () => {
    const payload = { language, code, input, userId, problemId };
    try {
      const { data } = await axios.post("http://localhost:8000/run", payload);
      setOutput(data.output);
      setVerdict(data.verdict);
    } catch (error) {
      setOutput(error?.response?.data?.error || 'Something went wrong');
      setVerdict('');
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col lg:flex-row items-stretch">
      {/* LEFT PANEL (Title + Description) */}
      <div className="lg:w-1/2 lg:pr-4 mb-4 lg:mb-0">
        {showProblemDetails && problem && (
          <>
            <h1 className="text-3xl font-bold mb-3">{problem.title}</h1>
            <div className="mb-4 text-gray-700 bg-gray-50 p-4 rounded shadow-sm max-h-[300px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">Problem Description</h2>
              <pre className="text-sm whitespace-pre-wrap">{problem.description}</pre>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL (Code Editor, Input, Output) */}
      <div className="lg:w-1/2 lg:pl-8 flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Language</label>
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

        <div className="bg-gray-100 shadow-md w-full" style={{ height: '300px', overflowY: 'auto' }}>
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={getHighlightedCode}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              backgroundColor: '#f7fafc',
              height: '100%',
            }}
          />
        </div>

        <textarea
          rows="5"
          value={input}
          placeholder="Enter input here"
          onChange={(e) => setInput(e.target.value)}
          className="border border-gray-300 rounded-sm py-1.5 px-4 focus:outline-none focus:border-indigo-500 resize-none w-full"
        />

        <button
          onClick={handleSubmit}
          type="button"
          className="w-full mt-2 bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Run Code
        </button>

        <div className="bg-gray-100 rounded-sm shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <div
            className="whitespace-pre-wrap"
            style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 12 }}
          >
            {output}
          </div>
        </div>

        {verdict && (
          <div className="mt-2 text-sm font-semibold">
            Verdict:{' '}
            <span
              className={`px-2 py-1 rounded ${
                verdict === 'Accepted'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
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
