import { useState } from "react";
import {
  Bell,
  Link as LinkIcon,
  Info,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Timer,
  AlignLeft,
  Type,
  ImageOff,
  Plus,
  Download,
  Search,
  AlertCircle,
  Globe,
} from "lucide-react";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputError, setInputError] = useState(null);

  // States: 'idle', 'analyzing', 'results', 'error'
  const [appState, setAppState] = useState("idle");

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setInputError(null);
    setError(null);
    setResult(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setInputError("Please enter a URL");
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setInputError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setInputError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setLoading(true);
    setAppState("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
        setAppState("results");
      } else {
        setError(data.error);
        setAppState("error");
      }
    } catch {
      setError({ message: "Failed to connect to the analysis server." });
      setAppState("error");
    } finally {
      setLoading(false);
    }
  }

  function handleTryLink(exampleUrl) {
    setUrl(`https://${exampleUrl}`);
    // We don't auto-submit to let them see it, but we could.
  }

  return (
    <>
      {/* ── Navigation Bar ───────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-10">
          <div className="font-bold text-xl text-blue-600 tracking-tight">
            Page Pulse
          </div>
          <div className="hidden md:flex items-center h-full space-x-8 text-sm font-medium text-gray-500">
            <a
              href="#"
              className="h-16 flex items-center text-blue-600 border-b-2 border-blue-600 px-1"
            >
              Dashboard
            </a>
            <a href="#" className="h-16 flex items-center hover:text-gray-900 px-1">
              Audits
            </a>
            <a href="#" className="h-16 flex items-center hover:text-gray-900 px-1">
              History
            </a>
            <a href="#" className="h-16 flex items-center hover:text-gray-900 px-1">
              Settings
            </a>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button className="text-gray-400 hover:text-gray-600">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
            {/* Placeholder avatar */}
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f3f4f6"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        
        {/* Header changes based on state */}
        {appState === "idle" && (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Page Pulse
            </h1>
            <p className="text-gray-500 text-lg">
              Instant health & SEO snapshot for any webpage.
            </p>
          </div>
        )}

        {appState === "analyzing" && (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Precision SEO Analysis
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Enter a URL to initiate a comprehensive technical audit, performance breakdown, and actionable optimization insights.
            </p>
          </div>
        )}

        {appState === "error" && (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Run SEO Audit
            </h1>
            <p className="text-gray-500 text-lg">
              Analyze any URL for technical SEO performance and actionable insights.
            </p>
          </div>
        )}

        {/* The Search Box - Changes style slightly in Results state */}
        {appState !== "results" && (
          <div className="max-w-2xl mx-auto w-full mb-8">
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-200 p-5 sm:p-8">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative flex items-center">
                    <div className="absolute left-4 text-gray-400">
                      {appState === "error" ? <Search size={20} /> : <LinkIcon size={20} />}
                    </div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setInputError(null);
                      }}
                      placeholder={
                        appState === "error"
                          ? "https://example.com/broken-link-test-page"
                          : "https://example.com"
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      loading
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
                {inputError && (
                  <p className="text-red-500 text-sm mt-2 ml-1">{inputError}</p>
                )}
              </form>

              {appState === "idle" && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4 flex items-center gap-3 text-gray-600 border border-gray-100">
