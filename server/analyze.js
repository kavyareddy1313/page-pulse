const { parsePageMetrics } = require("./parsers/parsePageMetrics.js");
const axios = require("axios");

async function analyzeUrl(rawUrl) {
  try {
    let parsedUrl;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return {
        status: 400,
        body: {
          success: false,
          error: {
            type: "INVALID_URL",
            message:
              "Please enter a valid URL (must start with http:// or https://)",
          },
        },
      };
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        status: 400,
        body: {
          success: false,
          error: {
            type: "INVALID_URL",
            message: "URL must use http:// or https:// protocol",
          },
        },
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // Increased timeout slightly for SPAs

    let response;
    let responseTimeMs;
    const startTime = Date.now();

    try {
      const apiKey = process.env.SCRAPINGANT_API_KEY;
      
      // If the user has provided an API key, we use ScrapingAnt to render JS and bypass Cloudflare
      if (apiKey) {
        response = await axios.get("https://api.scrapingant.com/v2/general", {
          params: {
            url: parsedUrl.href,
            "x-api-key": apiKey,
            browser: true, // Enables JavaScript rendering
          },
          signal: controller.signal,
          validateStatus: () => true // Resolve on any status code
        });
      } else {
        // Fallback to standard Axios request (fixes IPv6 hanging bug in native fetch)
        response = await axios.get(parsedUrl.href, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          maxRedirects: 5,
          validateStatus: () => true
        });
      }
    } catch (err) {
      clearTimeout(timeout);

      if (err.name === "CanceledError" || err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        return {
          status: 408,
          body: {
            success: false,
            error: {
              type: "TIMEOUT",
              message: "Request timed out — the site took longer to respond",
            },
          },
        };
      }

      return {
        status: 502,
        body: {
          success: false,
          error: {
            type: "FETCH_FAILED",
            message: "Could not reach that URL — the site may be down or the domain may not exist",
          },
        },
      };
    }

    clearTimeout(timeout);
    responseTimeMs = Date.now() - startTime;

    // Determine content type (ScrapingAnt returns the target site's headers in response.headers if configured, but by default it returns text/html)
    const contentType = response.headers["content-type"] || "";
    // If the request was successful but didn't return HTML
    if (response.status === 200 && !contentType.includes("text/html") && !process.env.SCRAPINGANT_API_KEY) {
      return {
        status: 422,
        body: {
          success: false,
          error: {
            type: "NON_HTML_RESPONSE",
            message: `That URL didn't return an HTML page (received ${contentType.split(";")[0].trim() || "unknown content type"})`,
          },
        },
      };
    }

    const html = response.data;
    const metrics = parsePageMetrics(html);

    return {
      status: 200,
      body: {
        success: true,
        data: {
          url: parsedUrl.href,
          statusCode: response.status,
          responseTimeMs,
          pageTitle: metrics.pageTitle,
          metaDescription: metrics.metaDescription,
          h1Count: metrics.h1Count,
          imagesMissingAlt: metrics.imagesMissingAlt,
          wordCount: metrics.wordCount,
        },
      },
    };
  } catch (err) {
    console.error("Unexpected error in analyzeUrl:", err);
    return {
      status: 500,
      body: {
        success: false,
        error: {
          type: "UNKNOWN",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while analyzing the URL",
        },
      },
    };
  }
}

module.exports = { analyzeUrl };
