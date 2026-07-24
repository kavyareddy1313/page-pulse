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
