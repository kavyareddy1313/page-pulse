const express = require("express");
const cors = require("cors");
const { analyzeUrl } = require("./analyze.js");

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from the Vite dev server during local development
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
  })
);

app.use(express.json());

// ── POST /api/analyze — main SEO analysis endpoint ──────────────────
app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({
      success: false,
      error: {
        type: "INVALID_URL",
        message: "Please provide a URL to analyze",
      },
    });
    return;
  }

  const result = await analyzeUrl(url.trim());
  res.status(result.status).json(result.body);
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Page Pulse API running on http://localhost:${PORT}`);
});

module.exports = app;
