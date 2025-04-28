import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function Submission() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(getDefaultCode('cpp'));
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  function getDefaultCode(lang) {
    switch (lang) {
      case 'cpp':
        return `#include <iostream>
using namespace std;
int main() {
    int num1, num2;
    cin >> num1 >> num2;
    cout << num1 + num2;
    return 0;
}`;
      case 'java':
        return `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int num1 = sc.nextInt();
        int num2 = sc.nextInt();
        System.out.println(num1 + num2);
    }
}`;
      case 'python':
        return `num1 = int(input())
num2 = int(input())
print(num1 + num2)`;
      default:
        return '';
    }
  }

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(getDefaultCode(selectedLang));
    setOutput('');
  };

  const handleSubmit = async () => {
    const payload = { language, code, input };

    try {
      const { data } = await axios.post('http://localhost:8000/run', payload);
      setOutput(data.output);
    } catch (error) {
      console.log(error?.response?.data || error.message);
      setOutput('Error occurred while running the code');
    }
  };

  // Mapping our language to Monaco Editor's language id
  const getMonacoLang = (lang) => {
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
      <div className="lg:w-1/2 lg:pr-4 mb-4 lg:mb-0">
        <h1 className="text-3xl font-bold mb-3">AlgoU Online Judge - Code Submission</h1>

        <div className="mb-4">
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

        {/* Monaco Editor */}
        <div className="mb-4">
          <Editor
            height="300px"
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
          className="w-full text-center mt-4 bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Run Code
        </button>
      </div>

      {/* Input and Output */}
      <div className="lg:w-1/2 lg:pl-8 pt-10">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Input</h2>
          <textarea
            rows="5"
            value={input}
            placeholder="Enter input here"
            onChange={(e) => setInput(e.target.value)}
            className="border border-gray-300 rounded-sm py-1.5 px-4 mb-1 focus:outline-none focus:border-indigo-500 resize-none w-full"
            style={{ minHeight: '100px' }}
          />
        </div>

        <div className="bg-gray-100 rounded-sm shadow-md p-4 h-28">
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <div style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 12 }}>
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Submission;
