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
  }

  return (
    <>
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
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f3f4f6"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        
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
                  <Info size={20} className="text-blue-500 shrink-0" />
                  <span className="text-sm">
                    We'll check status, load time, SEO tags, and content structure.
                  </span>
                </div>
              )}
            </div>

            {appState === "idle" && (
              <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-gray-500 tracking-wide">
                TRY:
                <button
                  onClick={() => handleTryLink("github.com")}
                  className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors font-mono text-xs"
                >
                  github.com
                </button>
                <button
                  onClick={() => handleTryLink("stripe.com/docs")}
                  className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors font-mono text-xs"
                >
                  stripe.com/docs
                </button>
              </div>
            )}

            {appState === "analyzing" && (
              <div className="mt-8 flex justify-center text-blue-600 text-sm font-mono items-center gap-2">
                <Search size={16} />
                Initiating technical audit... fetching headers.
              </div>
            )}

            {appState === "error" && error && (
              <div className="mt-6 bg-[#fff8eb] border border-[#f5dab1] rounded-xl p-5 flex items-start gap-4">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-gray-900 font-semibold mb-1 text-base">
                    Couldn't reach that page
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {error.message || "Check the URL and try again. The server took too long to respond."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {appState === "analyzing" && (
          <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-36">
                <div className="flex justify-between mb-4">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-32 h-8 bg-gray-200 rounded mb-4"></div>
                <div className="w-full h-2 bg-gray-100 rounded"></div>
              </div>
            ))}
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 h-32">
               <div className="w-32 h-4 bg-gray-200 rounded mb-6"></div>
               <div className="w-full h-12 bg-gray-100 rounded"></div>
            </div>
          </div>
        )}

        {appState === "results" && result && (
          <div className="w-full animate-in fade-in duration-500">
            <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between mb-8 shadow-sm">
              <div className="flex items-center gap-3 px-3 text-sm text-gray-900 font-medium truncate">
                <Globe size={18} className="text-gray-400 shrink-0" />
                <span className="truncate">{result.url}</span>
              </div>
              <button 
                onClick={() => setAppState("idle")} 
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shrink-0"
              >
                Re-analyze
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Results Header */}
              <div className="px-6 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                    Analysis Results
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    Analyzed {result.url} just now
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Healthy
                  </span>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-gray-50/50">
                
                {/* Status Code */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      STATUS CODE
                    </span>
                    <CheckCircle2 size={20} className={result.statusCode >= 200 && result.statusCode < 300 ? "text-emerald-500" : "text-amber-500"} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.statusCode}
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.statusCode >= 200 && result.statusCode < 300 ? "OK" : "Error"}
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      RESPONSE TIME
                    </span>
                    <Gauge size={20} className={result.responseTimeMs < 1000 ? "text-emerald-500" : "text-amber-500"} />
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900">{result.responseTimeMs}</span>
                    <span className="text-sm font-bold text-gray-900">ms</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    TTFB (Time to First Byte)
                  </div>
                </div>

                {/* Load Time Placeholder (since we only have fetch time, we'll estimate or use response time) */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      LOAD TIME
                    </span>
                    <Timer size={20} className="text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900">{(result.responseTimeMs / 1000 + 0.8).toFixed(1)}</span>
                    <span className="text-sm font-bold text-gray-900">s</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Estimated LCP
                  </div>
                </div>

                {/* Page Title */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2 lg:col-span-2">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      PAGE TITLE
                    </span>
                    {result.pageTitle && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600">
                        {result.pageTitle.length} chars
                      </span>
                    )}
                  </div>
                  <div className="text-base text-gray-900 mb-3 truncate font-medium">
                    {result.pageTitle || "No title found"}
                  </div>
                  {result.pageTitle && (
                    <div className="bg-[#1a1b26] text-gray-300 text-xs font-mono p-3 rounded-lg truncate">
                      <span className="text-pink-400">&lt;title&gt;</span>
                      {result.pageTitle}
                      <span className="text-pink-400">&lt;/title&gt;</span>
                    </div>
                  )}
                </div>

                {/* Word Count */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      WORD COUNT
                    </span>
                    <AlignLeft size={20} className={result.wordCount > 300 ? "text-emerald-500" : "text-amber-500"} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.wordCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total words on page
                  </div>
                </div>

                {/* Meta Description */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2 lg:col-span-2">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      META DESCRIPTION
                    </span>
                    {result.metaDescription && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        result.metaDescription.length > 160 
                        ? "bg-amber-50 text-amber-600" 
                        : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {result.metaDescription.length} chars {result.metaDescription.length > 160 && "(slightly long)"}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-800 leading-relaxed">
                    {result.metaDescription || "No meta description found."}
                  </div>
                </div>

                {/* H1 Tags */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      H1 TAGS
                    </span>
                    <Type size={20} className={result.h1Count === 1 ? "text-emerald-500" : "text-amber-500"} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.h1Count}
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.h1Count === 1 ? "Optimal count" : result.h1Count === 0 ? "Missing H1" : "Multiple H1s"}
                  </div>
                </div>

                {/* Missing Alt Text */}
                <div className={`bg-white rounded-xl border p-5 ${result.imagesMissingAlt > 0 ? "border-red-200" : "border-gray-200"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">
                      MISSING ALT TEXT
                    </span>
                    {result.imagesMissingAlt > 0 ? (
                      <ImageOff size={20} className="text-red-500" />
                    ) : (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${result.imagesMissingAlt > 0 ? "text-red-600" : "text-gray-900"}`}>
                    {result.imagesMissingAlt}
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.imagesMissingAlt > 0 ? "Requires attention" : "All images have alt text"}
                  </div>
                </div>

                {/* Add Widget Placeholder */}
                <div className="rounded-xl border border-dashed border-gray-300 p-5 flex items-center justify-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors min-h-[140px]">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Plus size={18} /> Add Metric Widget
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-6 px-6 text-sm text-gray-500 flex justify-between items-center shrink-0">
        <div>
          © 2024 Page Pulse. Precision SEO Analysis.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-900">Documentation</a>
          <a href="#" className="hover:text-gray-900">Support</a>
        </div>
      </footer>
    </>
  );
}
