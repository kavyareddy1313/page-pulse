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
