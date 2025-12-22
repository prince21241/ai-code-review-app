import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/clerk-react";
import "./App.css";

function App() {
  const { getToken } = useAuth();
  const [code, setCode] = useState("// Write your code here\nfunction example() {\n  return 'Hello, World!';\n}");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [liveIssues, setLiveIssues] = useState([]);
  const [wsRef, setWsRef] = useState(null);
  const [typingTimer, setTypingTimer] = useState(null);

  const languageExtensions = {
    javascript: javascript(),
    python: python(),
    java: java(),
  };

  async function fetchSubmissions() {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("http://localhost:8000/api/submissions", { headers });
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  }

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 3000); // Refresh every 3 seconds
    
    // Setup websocket
    const ws = new WebSocket("ws://localhost:8000/ws/review");
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.issues) setLiveIssues(data.issues);
      } catch (_) {}
    };
    setWsRef(ws);
    
    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!wsRef || wsRef.readyState !== WebSocket.OPEN) return;
    if (typingTimer) clearTimeout(typingTimer);
    const t = setTimeout(() => {
      wsRef.send(JSON.stringify({ code, language: selectedLanguage }));
    }, 300);
    setTypingTimer(t);
    return () => clearTimeout(t);
  }, [code, selectedLanguage, wsRef]);

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8000/api/submissions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ code, language: selectedLanguage }),
      });
      const data = await res.json();
      setResult(data);
      setTimeout(() => {
        fetchSubmissions();
        setResult(null);
      }, 1000);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = submissions.filter((s) =>
    languageFilter === "all" ? true : (s.language || "").toLowerCase() === languageFilter
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      reviewed: "bg-green-100 text-green-800 border-green-200",
      error: "bg-red-100 text-red-800 border-red-200",
    };
    return badges[status] || badges.pending;
  };

  const formatReview = (review) => {
    if (!review) return "";
    // Simple markdown-like formatting
    return review
      .split("\n")
      .map((line, idx) => {
        if (line.startsWith("##")) {
          return <h3 key={idx} className="font-bold text-lg mt-4 mb-2 text-gray-900">{line.replace(/##/g, "")}</h3>;
        }
        if (line.startsWith("###")) {
          return <h4 key={idx} className="font-semibold text-base mt-3 mb-1 text-gray-800">{line.replace(/###/g, "")}</h4>;
        }
        if (line.startsWith("-") || line.startsWith("*")) {
          return <li key={idx} className="ml-4 mb-1 text-gray-700">{line.replace(/^[-*]\s*/, "")}</li>;
        }
        if (line.trim() === "") {
          return <br key={idx} />;
        }
        return <p key={idx} className="mb-2 text-gray-700">{line}</p>;
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-scale-in">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text animate-fade-in">
                  AI Code Review
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/prince21241"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-110 animate-fade-in"
                aria-label="Visit Prince Raval's GitHub profile"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <SignedOut>
                <div className="flex items-center space-x-2">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-105 rounded-lg hover:bg-gray-100">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center relative z-10">
            <div className="max-w-md animate-fade-in-up">
              <h2 className="text-4xl font-bold gradient-text mb-4 animate-fade-in">Welcome to AI Code Review</h2>
              <p className="text-lg text-gray-600 mb-8 animate-fade-in animate-delay-200">
                Sign in to start reviewing your code with AI-powered analysis
              </p>
              <div className="flex items-center justify-center space-x-4 animate-fade-in-up animate-delay-300">
                <SignInButton mode="modal">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 button-pulse">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </SignedOut>
        <SignedIn>
          {/* Code Editor Section */}
          <div className="mb-8 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Code Editor</h2>
                  <div className="flex items-center space-x-3">
                    <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    </select>
                    <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Submit for Review"
                    )}
                  </button>
                  </div>
                </div>
              </div>
            
              <div className="p-4">
                <CodeMirror
                  value={code}
                  height="400px"
                  extensions={[languageExtensions[selectedLanguage]]}
                  onChange={(value) => setCode(value)}
                  className="rounded-lg overflow-hidden border border-gray-300"
                />
              </div>

              {/* Live Review Panel */}
              {liveIssues.length > 0 && (
                <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">Live Analysis</h3>
                  </div>
                  <ul className="space-y-2">
                    {liveIssues.map((it, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className={`mr-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          it.severity === 'danger' 
                            ? 'bg-red-100 text-red-800 shadow-sm' 
                            : it.severity === 'warn' 
                            ? 'bg-yellow-100 text-yellow-800 shadow-sm' 
                            : 'bg-blue-100 text-blue-800 shadow-sm'
                        }`}>
                          {it.severity}
                        </span>
                        <span className="text-gray-700 flex-1">{it.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Submissions Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Recent Reviews</h2>
                <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                </select>
              </div>
            </div>

            <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Submit your first code review to get started!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filtered.map((s, idx) => (
                  <div key={s.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-semibold rounded-full">
                          #{s.id}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full uppercase">
                          {(s.language || "unknown")}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(s.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Code</h4>
                      <div className="rounded-lg overflow-hidden border border-gray-700">
                        <CodeMirror
                          value={s.code}
                          height="auto"
                          minHeight="100px"
                          extensions={[
                            languageExtensions[s.language?.toLowerCase() || 'javascript'],
                            oneDark
                          ]}
                          editable={false}
                          readOnly={true}
                          basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            dropCursor: false,
                            allowMultipleSelections: false,
                            indentOnInput: false,
                          }}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800">AI Review</h4>
                      </div>
                      {s.status === "pending" || s.status === "processing" ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <svg className="animate-spin h-5 w-5 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm text-yellow-800 font-medium">
                              {s.status === "processing" ? "Review in progress..." : "Review pending..."}
                            </span>
                          </div>
                        </div>
                      ) : s.review ? (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 shadow-sm">
                          <div className="prose prose-sm max-w-none">
                            {formatReview(s.review)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No review available</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </SignedIn>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm relative z-10 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Designed & Developed by <span className="font-semibold gradient-text">Prince Raval</span> · © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
