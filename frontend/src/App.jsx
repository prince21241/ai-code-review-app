import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

function App() {
  const [code, setCode] = useState("// write your code here");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "javascript" }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

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
        <button onClick={handleSubmit} disabled={submitting} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Code"}
        </button>
        {result && (
          <pre className="mt-4 text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default App;

