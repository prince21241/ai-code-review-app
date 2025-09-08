import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

function App() {
  const [code, setCode] = useState("// write your code here");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [liveIssues, setLiveIssues] = useState([]);
  const [wsRef, setWsRef] = useState(null);
  const [typingTimer, setTypingTimer] = useState(null);

  async function fetchSubmissions() {
    try {
      const res = await fetch("http://localhost:8000/api/submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      // ignore for now
    }
  }

  useEffect(() => {
    fetchSubmissions();
    // setup websocket
    const ws = new WebSocket("ws://localhost:8000/ws/review");
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.issues) setLiveIssues(data.issues);
      } catch (_) {}
    };
    setWsRef(ws);
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!wsRef || wsRef.readyState !== WebSocket.OPEN) return;
    if (typingTimer) clearTimeout(typingTimer);
    const t = setTimeout(() => {
      wsRef.send(JSON.stringify({ code, language: "javascript" }));
    }, 300);
    setTypingTimer(t);
    return () => clearTimeout(t);
  }, [code, wsRef]);

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
      fetchSubmissions();
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = submissions.filter((s) =>
    languageFilter === "all" ? true : (s.language || "").toLowerCase() === languageFilter
  );

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
        <div className="mt-3 text-sm bg-white border rounded p-3 shadow-sm">
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white mr-2">AI</span>
            <span className="text-gray-700 font-semibold">Live Review</span>
          </div>
          {liveIssues.length === 0 ? (
            <div className="text-gray-500">No issues.</div>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {liveIssues.map((it, idx) => (
                <li key={idx} className="text-gray-800">
                  <span className={`mr-2 inline-block text-xs px-2 py-0.5 rounded ${it.severity === 'danger' ? 'bg-red-100 text-red-800' : it.severity === 'warn' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>{it.severity}</span>
                  {it.message}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Code"}
        </button>
        {result && (
          <pre className="mt-4 text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>

      <div className="w-full max-w-2xl mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Recent Submissions</h2>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div className="space-y-4">
          {filtered.map((s) => (
            <div key={s.id} className="border rounded p-3 bg-white shadow-sm">
              <div className="text-xs text-gray-500">ID: {s.id} • {(s.language || "unknown").toUpperCase()} • {new Date(s.created_at).toLocaleString()}</div>
              <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto whitespace-pre-wrap">{s.code}</pre>
              <div className="mt-2">
                <div className="font-medium mb-1">AI Review</div>
                {s.status !== "reviewed" ? (
                  <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">Review pending…</div>
                ) : (
                  <div className="text-sm bg-white border rounded p-3 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white mr-2">AI</span>
                      <span className="text-gray-700 font-semibold">Basic Review</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-gray-800">{s.review}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-gray-500">No submissions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

