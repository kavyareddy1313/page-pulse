# Page Pulse — Website health & SEO checker

Instant health and technical SEO snapshot for any webpage.

## Live Demo
- **Live Frontend**: https://page-pulse-nine-pink.vercel.app/ 

- **Walkthrough Video**: https://drive.google.com/file/d/1O7aSX7gIFlxoQ1lJbpPXbc-WgPr1RbGQ/view?usp=drive_link
>>>>>>> 86f8d8e06a8661370e585a2e92ae64eb5d481000

## Setup Instructions

This project is separated into a Node.js backend and a React frontend. To run the full stack locally:

### 1. Backend
```bash
# In the root folder (or backend directory)
npm install
npm run dev:server
```
The backend API will run on `http://localhost:3001`.

### 2. Frontend
```bash
# In a new terminal, navigate to the client folder
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`. 
*Note: In local development, the frontend's Vite server (`client/vite.config.js`) proxies all `/api` requests directly to `http://localhost:3001`.*

## API Contract

### `POST /api/analyze`

**Request Body**
```json
{
  "url": "https://example.com"
}
```

**Success Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "statusCode": 200,
    "responseTimeMs": 145,
    "pageTitle": "Example Domain",
    "metaDescription": null,
    "h1Count": 1,
    "imagesMissingAlt": 0,
    "wordCount": 35
  }
}
```

**Error Responses**
All errors follow a flat enum shape with specific HTTP status codes:
- `400 Bad Request` -> `INVALID_URL`: The provided URL was missing or malformed (not starting with http/https).
- `408 Request Timeout` -> `TIMEOUT`: The target site took longer than 8 seconds to respond.
- `422 Unprocessable Entity` -> `NON_HTML_RESPONSE`: The target URL returned a PDF, image, JSON, etc., instead of `text/html`.
- `502 Bad Gateway` -> `FETCH_FAILED`: The domain could not be reached, resolved, or the connection was refused.
- `500 Internal Server Error` -> `UNKNOWN`: An unexpected exception occurred during processing.

*Example Error JSON:*
```json
{
  "success": false,
  "error": {
    "type": "TIMEOUT",
    "message": "Request timed out — the site took longer than 8 seconds to respond"
  }
}
```

**Example cURL Commands**
*Success Case:*
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

*Error Case (Invalid URL):*
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"not-a-url"}'
```

## Design Decisions

1. **Why separate React frontend + Node/Express backend instead of a single full-stack framework?**
   I chose a decoupled architecture to ensure the API logic is independently testable, reusable, and cleanly separated from the UI layer. This mimics real-world microservice boundaries where the backend could eventually serve multiple clients (like a mobile app) without being tightly bound to a specific frontend framework's rendering engine.

2. **Why cheerio for HTML parsing instead of a full headless browser (e.g., Puppeteer)?**
   The technical requirements only necessitate static DOM inspection (reading titles, meta tags, headers, and image attributes). A headless browser would be massive overkill, significantly increasing memory overhead, slowing down response times, and introducing complex dependency issues on lightweight serverless hosting environments. Cheerio is fast, lightweight, and perfect for static HTML traversal.

3. **Why the flat error-type enum instead of just HTTP status codes?**
   While HTTP status codes are great for protocol-level semantics, they often lack the granularity needed for a good user experience. By returning a strict, explicit enum string (like `NON_HTML_RESPONSE` vs `TIMEOUT`), the frontend can reliably map specific failure modes to highly actionable, human-readable UI alerts without trying to guess what a generic `400` or `500` means.

## Testing

The project uses **Jest** for unit testing the core parsing logic on the backend.
To run the tests:
```bash
npm run test
```

**Test Coverage:**
The `parsePageMetrics.test.js` suite covers:
1. **Happy path:** Verifies correct extraction of all metrics (title, description, counts) from well-formed HTML.
2. **Empty response body:** Ensures the parser doesn't crash and returns sensible fallback zero/null values when encountering empty strings.
3. **Malformed HTML:** Simulates heavily broken HTML (missing closing tags) to verify that the parser remains resilient and extracts what it reasonably can.
4. **Zero-value handling:** Confirms that pages with genuinely zero `<h1>` tags or images return a literal `0` instead of `null` or `undefined`.

## What I'd improve with another day

With another day of development, I would implement robust rate-limiting and response caching using Redis. Since auditing a page can be relatively slow and network-heavy, caching the results of recently analyzed URLs for an hour would drastically improve perceived performance and protect the server from abuse. I would also add more nuanced metrics, such as detecting canonical URLs and checking for basic OpenGraph meta tags.

