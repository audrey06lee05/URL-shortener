-- seed.sql — Test data for Step 9 (manual API testing). Paste into
-- pgAdmin's query tool and run once against the schema in scheme.sql,
-- before you start testing endpoints by hand.

-- Wipe both tables and reset the SERIAL counters, so this script can
-- be re-run any time without hitting a duplicate short_code error
-- (CASCADE also clears clicks, since clicks.url_id references urls)
TRUNCATE TABLE urls RESTART IDENTITY CASCADE;

-- ── urls ──────────────────────────────────────────────────────────

-- Normal, active link — this is the one with clicks spread across
-- several days below (covers multi-day clicks, click-count accuracy,
-- and the clicks-by-day analytics query)
INSERT INTO urls (original_url, short_code, created_at, expires_at)
VALUES ('https://www.freecodecamp.org/', 'welcome', '2026-09-08 10:00:00', NULL);

-- Custom-alias link with zero clicks — POST a new url with alias
-- 'my-docs' and confirm you get a 409; also exercises analytics on a
-- url that has never been clicked (count 0, last_click null)
INSERT INTO urls (original_url, short_code, created_at, expires_at)
VALUES ('https://developer.mozilla.org/en-US/docs/Web', 'my-docs', '2026-09-12 09:00:00', NULL);

-- Already-expired link — expires_at is in the past relative to today
-- (2026-09-15), so GET /old-promo should 410 instead of redirecting
INSERT INTO urls (original_url, short_code, created_at, expires_at)
VALUES ('https://example.com/summer-sale', 'old-promo', '2026-09-01 12:00:00', '2026-09-10 00:00:00');

-- Plain link kept simple on purpose — use this one for the DELETE
-- test; its clicks (below) should disappear too via ON DELETE CASCADE
INSERT INTO urls (original_url, short_code, created_at, expires_at)
VALUES ('https://example.com/temp-page', 'temp-delete', '2026-09-13 15:00:00', NULL);

-- ── clicks ────────────────────────────────────────────────────────
-- Each row looks up its url_id by short_code with a subquery instead
-- of a hardcoded number, so it still works even if the ids above ever
-- shift around

-- 'welcome': 5 clicks across 3 different calendar days, so the
-- clicks-by-day analytics query has more than one day to group
INSERT INTO clicks (url_id, clicked_at, referrer, user_agent)
VALUES
  ((SELECT id FROM urls WHERE short_code = 'welcome'), '2026-09-10 09:14:00', 'https://google.com', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
  ((SELECT id FROM urls WHERE short_code = 'welcome'), '2026-09-10 18:47:00', NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'),
  ((SELECT id FROM urls WHERE short_code = 'welcome'), '2026-09-12 08:02:00', 'https://twitter.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
  ((SELECT id FROM urls WHERE short_code = 'welcome'), '2026-09-14 11:30:00', 'https://google.com', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
  ((SELECT id FROM urls WHERE short_code = 'welcome'), '2026-09-14 21:05:00', NULL, 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36');

-- 'old-promo': 2 clicks from while the link was still valid (before
-- its 2026-09-10 expiry) — confirms old click history survives after
-- a url expires, and analytics still reports it correctly
INSERT INTO clicks (url_id, clicked_at, referrer, user_agent)
VALUES
  ((SELECT id FROM urls WHERE short_code = 'old-promo'), '2026-09-02 13:00:00', 'https://facebook.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
  ((SELECT id FROM urls WHERE short_code = 'old-promo'), '2026-09-05 16:20:00', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

-- 'temp-delete': 1 click, just so DELETE /api/urls/:id has something
-- to cascade — after deleting, check this row is gone from clicks too
INSERT INTO clicks (url_id, clicked_at, referrer, user_agent)
VALUES
  ((SELECT id FROM urls WHERE short_code = 'temp-delete'), '2026-09-13 15:10:00', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
