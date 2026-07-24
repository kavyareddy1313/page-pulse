const { analyzeUrl } = require("../server/analyze.js");

/**
 * Vercel serverless function wrapper for the analyze endpoint.
 * Reuses the same core logic from server/analyze.js.
 */
module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      error: {
        type: "UNKNOWN",
        message: "Method not allowed — use POST",
      },
    });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        type: "INVALID_URL",
        message: "Please provide a URL to analyze",
      },
    });
  }

  const result = await analyzeUrl(url.trim());
  return res.status(result.status).json(result.body);
};
