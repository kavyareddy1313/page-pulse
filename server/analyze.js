const cheerio = require("cheerio");

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
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    const startTime = Date.now();

    try {
      response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });
    } catch (err) {
      clearTimeout(timeout);

      if (err instanceof Error && err.name === "AbortError") {
        return {
          status: 408,
          body: {
            success: false,
            error: {
              type: "TIMEOUT",
              message:
                "Request timed out — the site took longer than 8 seconds to respond",
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
            message:
              "Could not reach that URL — the site may be down or the domain may not exist",
          },
        },
      };
    }

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - startTime;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
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

    const html = await response.text();
    const $ = cheerio.load(html);

    const pageTitle = $("title").first().text().trim() || null;

    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || null;

    const h1Count = $("h1").length;

    let imagesMissingAlt = 0;
    $("img").each((_, el) => {
      const alt = $(el).attr("alt");
      if (alt === undefined || alt.trim() === "") {
        imagesMissingAlt++;
      }
    });

    $("script, style, noscript").remove();
    const visibleText = $("body").text();
    const words = visibleText
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((w) => w.length > 0);
    const wordCount = words.length;

    return {
      status: 200,
      body: {
        success: true,
        data: {
          url: parsedUrl.href,
          statusCode: response.status,
          responseTimeMs,
          pageTitle,
          metaDescription,
          h1Count,
          imagesMissingAlt,
          wordCount,
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
