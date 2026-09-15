-- scheme.sql — Database structure for the URL Shortener + Click Analytics API.
-- Two tables: urls (the shortened links) and clicks (one row per visit).
-- clicks links back to urls via url_id (one url -> many clicks).

-- The shortened links themselves
CREATE TABLE urls (
  id SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- One row per visit to a short URL
CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE, -- deleting a url deletes its clicks too
  clicked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT
);
