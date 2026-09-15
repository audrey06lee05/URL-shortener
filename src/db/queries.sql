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
