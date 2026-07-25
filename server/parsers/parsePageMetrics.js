const cheerio = require("cheerio");

function parsePageMetrics(html) {
  if (!html || typeof html !== "string") {
    return {
      pageTitle: null,
      metaDescription: null,
      h1Count: 0,
      imagesMissingAlt: 0,
      wordCount: 0,
    };
  }

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
    pageTitle,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount,
  };
}

module.exports = { parsePageMetrics };
