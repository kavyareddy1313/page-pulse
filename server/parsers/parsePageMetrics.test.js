const { parsePageMetrics } = require("./parsePageMetrics");

describe("parsePageMetrics", () => {
  it("extracts all fields from well-formed HTML (Happy path)", () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Happy Path Testing Page</title>
        <meta name="description" content="This is a great description for our page.">
      </head>
      <body>
        <h1>Welcome to the Test</h1>
        <p>This is a paragraph of visible text. It contains exactly eleven words.</p>
        <img src="logo.png" alt="Company Logo">
        <img src="spacer.gif">
      </body>
      </html>
    `;

    const result = parsePageMetrics(html);

    expect(result.pageTitle).toBe("Happy Path Testing Page");
    expect(result.metaDescription).toBe("This is a great description for our page.");
    expect(result.h1Count).toBe(1);
    expect(result.imagesMissingAlt).toBe(1);
    
    // Welcome(1) to(2) the(3) Test(4) This(5) is(6) a(7) paragraph(8) of(9) visible(10) text.(11) It(12) contains(13) exactly(14) eleven(15) words.(16)
    // "Welcome to the Test This is a paragraph of visible text. It contains exactly eleven words." -> 16 words
    expect(result.wordCount).toBe(16);
  });

  it("returns sensible defaults for empty/blank response body (Failure case)", () => {
    const html = "";
    
    // Assert it does NOT throw
    expect(() => parsePageMetrics(html)).not.toThrow();
    
    const result = parsePageMetrics(html);

    expect(result.pageTitle).toBeNull();
    expect(result.metaDescription).toBeNull();
    expect(result.h1Count).toBe(0);
    expect(result.imagesMissingAlt).toBe(0);
    expect(result.wordCount).toBe(0);
  });

  it("extracts what it reasonably can from malformed/broken HTML (Failure case)", () => {
    // Deliberately broken HTML (unclosed tags, missing structure)
    const html = `<html><title>Broken<body><h1>Oops<img src="x.png">`;
    
    // Assert it does NOT throw
    expect(() => parsePageMetrics(html)).not.toThrow();

    const result = parsePageMetrics(html);

    expect(result.pageTitle).toBe('Broken<body><h1>Oops<img src="x.png">'); // Cheerio handles unclosed title by reading the rest of the text
    expect(result.metaDescription).toBeNull();
    expect(result.h1Count).toBe(0);
    expect(result.imagesMissingAlt).toBe(0);
    expect(result.wordCount).toBe(0);
  });

  it("correctly handles zero H1 tags and zero images", () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>No headers or images</title>
      </head>
      <body>
        <p>Just some plain text here.</p>
      </body>
      </html>
    `;

    const result = parsePageMetrics(html);

    expect(result.pageTitle).toBe("No headers or images");
    expect(result.h1Count).toBe(0);
    expect(result.imagesMissingAlt).toBe(0);
    // Just(1) some(2) plain(3) text(4) here.(5) -> 5 words
    expect(result.wordCount).toBe(5);
  });
});
