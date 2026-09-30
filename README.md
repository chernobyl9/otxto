# otxto — Sports News CMS

A CMS-powered sports news landing page built on Cloudflare Workers, inspired by [ilovesporting.com](https://ilovesporting.com).

## Features

- **Landing page** with dark theme, green accent (#009A44), Plus Jakarta Sans font
- **Featured article** + article grid with category filtering
- **Article modal** for reading full content
- **CMS admin panel** at `/?section=cms` — create, edit, delete articles
- **D1 SQLite** for content storage (falls back to sample data if not configured)
- **REST API** for articles (`GET/POST/PUT/DELETE /api/articles`)

## Quick Start

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Create the D1 database

```bash
npx wrangler d1 create otxto-cms
```

Copy the `database_id` from the output into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "CMS_DB"
database_name = "otxto-cms"
database_id = "your-database-id-here"
```

### 3. Run the migration

```bash
npx wrangler d1 execute otxto-cms --file=./schema.sql
```

### 4. Deploy

```bash
npx wrangler deploy
```

### 5. Route otxto.org to the Worker

In `wrangler.toml`, uncomment:

```toml
[[routes]]
pattern = "otxto.org/*"
zone_name = "otxto.org"
```

Then redeploy. You can also set the route in the Cloudflare dashboard:
**Workers & Pages → otxto → Settings → Triggers → Routes → Add route → `otxto.org/*`**

## Usage

| URL | What it shows |
|---|---|
| `otxto.org/` | Landing page with articles |
| `otxto.org/?section=cms` | CMS admin panel |
| `otxto.org/api/articles` | API (GET articles) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/articles?limit=20&offset=0` | List articles |
| `POST` | `/api/articles` | Create article |
| `PUT` | `/api/articles/:id` | Update article |
| `DELETE` | `/api/articles/:id` | Delete article |

### Article object

```json
{
  "id": "uuid",
  "title": "Article title",
  "summary": "Short summary",
  "content": "Full article text",
  "image_url": "https://...",
  "category": "Football",
  "author": "Admin",
  "created_at": 1696000000000
}
```

## Tech

- Cloudflare Workers (single `src/index.js`)
- D1 SQLite for storage
- No build step — pure HTML/CSS/JS served from the Worker
- Fonts: Plus Jakarta Sans + JetBrains Mono (Google Fonts)
