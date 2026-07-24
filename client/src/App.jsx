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
