import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "../Submission.css"; 

function Submission() {
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(getDefaultCode("java"));
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function getDefaultCode(lang) {
    switch (lang) {
      case "cpp":
        return `#include <iostream>
using namespace std;
int main() {
    int num1, num2;
    cin >> num1 >> num2;
    cout << num1 + num2;
    return 0;
}`;
      case "java":
        return `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int num1 = sc.nextInt();
        int num2 = sc.nextInt();
        System.out.println(num1 + num2);
    }
}`;
      case "python":
        return `num1 = int(input())
num2 = int(input())
print(num1 + num2)`;
      default:
        return "";
    }
  }

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(getDefaultCode(selectedLang));
    setOutput("");
  };

  const handleSubmit = async () => {
    const payload = { language, code, input };
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, payload);
      setOutput(data.output);
    } catch (error) {
      console.error(error?.response?.data || error.message);
      setOutput("Error occurred while running the code");
    }
  };

  const getMonacoLang = (lang) => {
    switch (lang) {
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      case "python":
        return "python";
      default:
        return "plaintext";
    }
  };

  return (
    <div className="submission-bg min-h-screen w-full py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Online Compiler
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Editor */}
          <div className="flex-1 flex flex-col">
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Select Language:
              </label>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div className="flex-1 mb-4">
              <Editor
                height="400px"
                theme="vs-dark"
                language={getMonacoLang(language)}
                value={code}
                onChange={(newCode) => setCode(newCode)}
                options={{
                  fontSize: 14,
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-2 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Run Code
            </button>
          </div>

          {/* Right Side - Input and Output */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Input
              </h2>
              <textarea
                rows="6"
                value={input}
                placeholder="Enter input here..."
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-3 rounded-md bg-black text-green-400 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Output
              </h2>
              <div className="w-full min-h-[150px] p-3 rounded-md bg-black text-green-400 font-mono overflow-y-auto whitespace-pre-wrap">
                {output || "Output will appear here..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Submission;
