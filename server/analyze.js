const { parsePageMetrics } = require("./parsers/parsePageMetrics.js");
const axios = require("axios");
const puppeteerCore = require("puppeteer-core");
const sparticuzChromium = require("@sparticuz/chromium");

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
    const timeout = setTimeout(() => controller.abort(), 20000); // Allow up to 20s for Puppeteer

    let responseTimeMs;
    const startTime = Date.now();
    let html = "";
    let statusCode = 200;

    try {
      const apiKey = process.env.SCRAPINGANT_API_KEY;
      
      if (apiKey) {
        // Option 1: Fast & external headless API if user provides key
        const response = await axios.get("https://api.scrapingant.com/v2/general", {
          params: { url: parsedUrl.href, "x-api-key": apiKey, browser: true },
          signal: controller.signal,
          validateStatus: () => true
        });
        html = response.data;
        statusCode = response.status;
      } else {
        // Option 2: Native Headless Browsing via Puppeteer
        const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production";
        
        let browser;
        if (isProduction) {
          // On Vercel: use lightweight chromium binary
          browser = await puppeteerCore.launch({
            args: sparticuzChromium.args,
            defaultViewport: sparticuzChromium.defaultViewport,
            executablePath: await sparticuzChromium.executablePath(),
            headless: sparticuzChromium.headless,
            ignoreHTTPSErrors: true,
          });
        } else {
          // Local dev: use installed puppeteer
          const localPuppeteer = require("puppeteer");
          browser = await localPuppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          });
        }

        const page = await browser.newPage();
        
        // Emulate a standard browser to help bypass simple checks
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        
        // Go to page and wait for JS to render. Use domcontentloaded for SPAs with WebSockets
        const pageResponse = await page.goto(parsedUrl.href, { waitUntil: "domcontentloaded", timeout: 15000 });
        if (pageResponse) statusCode = pageResponse.status();
        
        // Wait a bit for JS frameworks to populate the DOM
        await new Promise(r => setTimeout(r, 3000));
        
        html = await page.content();
        await browser.close();
      }
    } catch (err) {
      clearTimeout(timeout);

      if (err.name === "CanceledError" || err.code === "ECONNABORTED" || err.message.includes("timeout") || err.message.includes("Timeout")) {
        return {
          status: 408,
          body: {
            success: false,
            error: {
              type: "TIMEOUT",
              message: "Request timed out — the site took longer to respond or block bots",
            },
          },
        };
      }

      console.error("Puppeteer/Axios Fetch Error:", err);
      return {
        status: 502,
        body: {
          success: false,
          error: {
            type: "FETCH_FAILED",
            message: "Could not reach that URL — the site may be down, or bot protections blocked access",
          },
        },
      };
    }

    clearTimeout(timeout);
    responseTimeMs = Date.now() - startTime;

    if (!html || typeof html !== "string") {
      return {
        status: 422,
        body: {
          success: false,
          error: {
            type: "NON_HTML_RESPONSE",
            message: `That URL didn't return an HTML page or was completely blocked`,
          },
        },
      };
    }

    const metrics = parsePageMetrics(html);

    return {
      status: 200,
      body: {
        success: true,
        data: {
          url: parsedUrl.href,
          statusCode,
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
