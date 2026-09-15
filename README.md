# 🔗 URL Shortener + Click Analytics API
🎯 A URL shortener with per-link click analytics — custom aliases, optional expiration dates, and a clicks-by-day breakdown, all backed by a two-table PostgreSQL schema.

Built as a learning project focused on REST API architecture (routes/controllers/services/middleware separation) and raw SQL. No ORM, no frontend framework — plain HTML/CSS/vanilla JS, no build step.

## 🗣️ Language & Technologies
* PostgreSQL
* Node.js + Express
* `pg` (raw SQL, no ORM)
* Vanilla HTML/CSS/JS — no framework, no build step

## 🗄️ Schema Design
* **urls** — id, original_url, short_code (`UNIQUE`), created_at, expires_at (nullable — no expiration if left unset)
* **clicks** — one row per visit to a short url, linked via `url_id` (one-to-many). `ON DELETE CASCADE` means deleting a url removes its click history too.
* Custom aliases and randomly generated short codes both go through the same uniqueness check before insert — the app retries with a new random code until one is free rather than ever risking a collision.
* Click analytics (total clicks, last click, clicks-by-day) aren't stored anywhere — they're calculated at request time straight from the `clicks` table (`COUNT`, `MAX`, and a `GROUP BY DATE(clicked_at)`), so they can never drift out of sync with the actual click history.

<img width="917" height="1018" alt="image" src="https://github.com/user-attachments/assets/5b7c2849-4544-4cb6-9416-c083f98f099f" />


## 🏗️ API Endpoints
| Method | Endpoint | Returns |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/db-health` | Database connectivity check |
| POST | `/api/urls` | Create a shortened url |
| GET | `/api/urls` | All urls, each with its click count |
| GET | `/api/urls/:id` | One url by id |
| DELETE | `/api/urls/:id` | Delete a url (cascades to its clicks) |
| GET | `/api/urls/:id/analytics` | Total clicks, last click, and clicks-by-day for a url |
| GET | `/:shortCode` | Redirects to the original url and logs a click |

### Example: create a shortened url
`POST /api/urls`
```json
{
  "originalUrl": "https://example.com/a-very-long-link",
  "customAlias": "my-link",
  "expiresAt": "2026-12-31"
}
```
→ `201 Created`
```json
{
  "id": 1,
  "original_url": "https://example.com/a-very-long-link",
  "short_code": "my-link",
  "created_at": "2026-09-15T10:00:00.000Z",
  "expires_at": "2026-12-31T00:00:00.000Z"
}
```
`customAlias` and `expiresAt` are both optional — omit `customAlias` for a random 6-character code, omit `expiresAt` for a link that never expires.

### Example: analytics
`GET /api/urls/1/analytics`
```json
{
  "urlId": 1,
  "shortCode": "my-link",
  "originalUrl": "https://example.com/a-very-long-link",
  "createdAt": "2026-09-15T10:00:00.000Z",
  "totalClicks": 6,
  "lastClick": "2026-09-15T15:01:10.090Z",
  "clicksByDay": [
    { "day": "2026-09-10", "count": "2" },
    { "day": "2026-09-14", "count": "3" },
    { "day": "2026-09-15", "count": "1" }
  ]
}
```

### Error responses
| Status | When |
|---|---|
| 400 | `originalUrl` missing/invalid, or `:id` isn't a number |
| 404 | Short code or url id doesn't exist |
| 409 | Custom alias already taken |
| 410 | Short url exists but has expired |

<img width="916" height="880" alt="image" src="https://github.com/user-attachments/assets/8c2e44bc-9d9f-47c6-a535-99164cea1473" />


## 🔧 Setup
1. Create a Postgres database (e.g. `url_shortener`)
2. Run `src/db/scheme.sql` against it — creates the `urls` and `clicks` tables
3. Add a `.env` file in the project root:
   ```
   DB_USER=<your postgres user>
   DB_PASSWORD=<your postgres password>
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=url_shortener
   PORT=3000
   ```
4. Install and start:
   ```
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` — the API and the frontend are served from the same Express app, so there's no separate client to start.

## 📌 How to Use
#### 🔗 Shorten a URL
Paste a long URL into the form, optionally set a custom alias and/or an expiration date, then hit **Shorten URL**. The short link appears with a **Copy** button.
#### 📋 Your Shortened URLs
The table below the form lists every url you've created, with its click count, created/expires dates, and per-row **View Analytics** / **Delete** actions. Delete asks for confirmation first and can't be undone.
#### 📊 Analytics
**View Analytics** opens a per-url page with total clicks, created date, last click time, and a day-by-day click breakdown.

## 🗂️ Query Log
`src/db/queries.sql` holds every raw SQL query used by the API, in the order the routes were built — creating and looking up urls, recording a click, the management endpoints (list/get/delete), and the two analytics queries (totals, and clicks grouped by day).

`src/db/seed.sql` seeds 4 test urls covering every Step 9 test case — an active link with multi-day click history, a zero-click link with a taken custom alias, an already-expired link, and a plain link for testing delete — handy for re-running the manual test pass at any time.
