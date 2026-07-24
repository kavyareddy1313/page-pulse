# Page Pulse ⚡

A full-stack website health & SEO checker that instantly analyzes any URL for key metrics.

![Page Pulse](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## What It Does

Enter any URL and Page Pulse will fetch the page and analyze:

- **HTTP Status Code** — with color-coded badges (2xx green, 4xx/5xx red)
- **Response Time** — measured in milliseconds
- **Page Title** — extracted from `<title>` tag
- **Meta Description** — from `<meta name="description">`
- **H1 Tag Count** — flags missing or multiple H1s
- **Images Missing Alt Text** — accessibility check
- **Word Count** — flags thin content (< 300 words)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| HTML Parsing | Cheerio |
| Deployment | Vercel |

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/kavyareddy1313/pulse-page.git
cd pulse-page

# 2. Install all dependencies
npm install
cd client && npm install && cd ..

# 3. Run both frontend and backend
npm run dev
```

This starts:
- **Frontend** at `http://localhost:5173` (Vite dev server)
- **Backend API** at `http://localhost:3001` (Express)

The Vite dev server proxies `/api/*` requests to the Express server automatically.

## API Endpoint

### `POST /api/analyze`

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "statusCode": 200,
    "responseTimeMs": 342,
    "pageTitle": "Example Domain",
    "metaDescription": null,
    "h1Count": 1,
    "imagesMissingAlt": 0,
    "wordCount": 28
  }
}
```

**Error Response (400/408/422/502/500):**
```json
{
  "success": false,
  "error": {
    "type": "INVALID_URL",
    "message": "Please enter a valid URL"
  }
}
```

## Error Handling

| Scenario | Status | Error Type |
|----------|--------|-----------|
| Invalid URL | 400 | `INVALID_URL` |
| Request timeout (> 8s) | 408 | `TIMEOUT` |
| Non-HTML response (PDF, image) | 422 | `NON_HTML_RESPONSE` |
| Network failure | 502 | `FETCH_FAILED` |
| Unexpected error | 500 | `UNKNOWN` |

## Deployment

This project deploys to **Vercel** with zero config:

1. Push to GitHub
2. Connect the repo in the [Vercel Dashboard](https://vercel.com/dashboard)
3. Deploy — no environment variables needed

## License

MIT