-- queries.sql — reference log of the raw SQL used by the API routes.
-- Kept separate from scheme.sql so it's easy to see every query used
-- in the app in one place, without digging through the service files.
-- ($1, $2, ... are placeholders — see the matching service file for the real values)

-- Sanity check — confirms Node can reach PostgreSQL (GET /db-health)
SELECT NOW();

-- Check whether a candidate short_code is already taken — either a custom
-- alias or a freshly generated random one (part of POST /api/urls)
SELECT id FROM urls WHERE short_code = $1;

-- Save a new shortened URL, returns the inserted row (POST /api/urls)
INSERT INTO urls (original_url, short_code, expires_at)
VALUES ($1, $2, $3)
RETURNING *;

-- Look up a url by its short_code, to redirect (GET /:shortCode)
SELECT * FROM urls WHERE short_code = $1;

-- Record one visit to a url, right before redirecting (part of GET /:shortCode)
INSERT INTO clicks (url_id, clicked_at, referrer, user_agent)
VALUES ($1, NOW(), $2, $3);

-- List all urls with each one's click count, newest first (GET /api/urls)
SELECT u.*, COUNT(c.id) AS click_count
FROM urls u
LEFT JOIN clicks c ON c.url_id = u.id
GROUP BY u.id
ORDER BY u.created_at DESC;

-- Get one url by id (GET /api/urls/:id)
SELECT * FROM urls WHERE id = $1;

-- Delete one url by id, returns the deleted row (DELETE /api/urls/:id)
-- (clicks for this url are removed automatically via ON DELETE CASCADE)
DELETE FROM urls WHERE id = $1 RETURNING *;

-- Total clicks + most recent click for one url (part of GET /api/urls/:id/analytics)
SELECT COUNT(*) AS total_clicks, MAX(clicked_at) AS last_click
FROM clicks
WHERE url_id = $1;

-- Clicks grouped by calendar day for one url (part of GET /api/urls/:id/analytics)
SELECT DATE(clicked_at) AS day, COUNT(*) AS count
FROM clicks
WHERE url_id = $1
GROUP BY DATE(clicked_at)
ORDER BY day ASC;
