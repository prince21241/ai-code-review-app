import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

function App() {
  const [code, setCode] = useState("// write your code here");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">AI Code Review App</h1>

      <div className="w-full max-w-2xl border rounded-lg shadow p-4 bg-white">
        <CodeMirror
          value={code}
          height="300px"
          extensions={[javascript()]}
          onChange={(value) => setCode(value)}
          theme="light"
        />
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Submit Code
        </button>
      </div>
    </div>
  );
}

export default App;

