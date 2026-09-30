-- otxto CMS — D1 Migration
-- Run this after creating your D1 database:
-- npx wrangler d1 create otxto-cms
-- npx wrangler d1 execute otxto-cms --file=./schema.sql

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  content TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  author TEXT DEFAULT 'Admin',
  created_at INTEGER NOT NULL,
  updated_at INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
