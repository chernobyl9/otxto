// otxto.org — CMS-powered landing page (inspired by ilovesporting.com)
// Sports content site with admin panel, content stored in D1 SQLite

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const section = url.searchParams.get('section');

    // --- API Routes ---
    if (path === '/api/articles' && request.method === 'GET') {
      return handleGetArticles(env, url);
    }
    if (path === '/api/articles' && request.method === 'POST') {
      return handleCreateArticle(request, env);
    }
    if (path.startsWith('/api/articles/') && request.method === 'DELETE') {
      const id = path.split('/').pop();
      return handleDeleteArticle(env, id);
    }
    if (path.startsWith('/api/articles/') && request.method === 'PUT') {
      const id = path.split('/').pop();
      return handleUpdateArticle(request, env, id);
    }

    // --- CMS Admin Panel ---
    if (section === 'cms' || path === '/cms') {
      return new Response(cmsAdminHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // --- Landing Page (default) ---
    return new Response(landingHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
};

// ============ API HANDLERS ============

async function handleGetArticles(env, url) {
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const result = await env.CMS_DB.prepare(
      'SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();

    return jsonResponse({ success: true, articles: result.results });
  } catch (e) {
    // Fallback: return sample articles if DB not set up yet
    return jsonResponse({ success: true, articles: getSampleArticles() });
  }
}

async function handleCreateArticle(request, env) {
  const body = await request.json();
  const { title, summary, content, image_url, category, author } = body;

  if (!title || !content) {
    return jsonResponse({ success: false, error: 'Title and content are required' }, 400);
  }

  try {
    const id = crypto.randomUUID();
    await env.CMS_DB.prepare(
      'INSERT INTO articles (id, title, summary, content, image_url, category, author, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, title, summary || '', content, image_url || '', category || 'General', author || 'Admin', Date.now()).run();

    return jsonResponse({ success: true, id });
  } catch (e) {
    return jsonResponse({ success: false, error: 'Database not configured. Set up D1 and run the migration.' }, 500);
  }
}

async function handleUpdateArticle(request, env, id) {
  const body = await request.json();
  const { title, summary, content, image_url, category, author } = body;

  try {
    await env.CMS_DB.prepare(
      'UPDATE articles SET title = ?, summary = ?, content = ?, image_url = ?, category = ?, author = ? WHERE id = ?'
    ).bind(title, summary, content, image_url, category, author, id).run();

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, error: 'Database not configured' }, 500);
  }
}

async function handleDeleteArticle(env, id) {
  try {
    await env.CMS_DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ success: false, error: 'Database not configured' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ============ SAMPLE DATA (fallback when D1 not configured) ============

function getSampleArticles() {
  return [
    {
      id: 'sample-1',
      title: 'Champions League Quarter-Final Draw Sets Up Blockbuster Ties',
      summary: 'Europe\'s elite clubs discover their fate as the draw delivers mouth-watering matchups.',
      content: 'The UEFA Champions League quarter-final draw has produced a series of blockbuster ties that promise to deliver drama, excitement, and unforgettable moments. With defending champions and perennial contenders pitted against each other, football fans are in for a treat.',
      image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
      category: 'Football',
      author: 'Editor',
      created_at: Date.now() - 3600000,
    },
    {
      id: 'sample-2',
      title: 'NBA Trade Deadline: Blockbuster Deals Shake Up the League',
      summary: 'Several contenders made bold moves to strengthen their rosters for a championship push.',
      content: 'The NBA trade deadline delivered fireworks as multiple contenders reshaped their rosters in pursuit of championship glory. The moves will have significant implications for the playoff race and the balance of power across the league.',
      image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      category: 'Basketball',
      author: 'Editor',
      created_at: Date.now() - 7200000,
    },
    {
      id: 'sample-3',
      title: 'F1 Season Opener: New Era of Racing Begins',
      summary: 'The new season kicks off with regulation changes that promise closer racing.',
      content: 'Formula 1 enters a new era with sweeping regulation changes designed to deliver closer, more competitive racing. The season opener showcased the potential of the new formula, with teams and drivers adapting to the technical revolution.',
      image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      category: 'Motorsport',
      author: 'Editor',
      created_at: Date.now() - 10800000,
    },
    {
      id: 'sample-4',
      title: 'Tennis: Next Generation Stars Rise at Grand Slam',
      summary: 'Young players announce their arrival on the biggest stage in tennis.',
      content: 'A new generation of tennis stars announced their arrival on the grandest stage, with stunning performances that signal a changing of the guard in the sport. The tournament delivered memorable matches and breakout performances.',
      image_url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
      category: 'Tennis',
      author: 'Editor',
      created_at: Date.now() - 14400000,
    },
    {
      id: 'sample-5',
      title: 'Olympics 2028: Host City Unveils Ambitious Plans',
      summary: 'Preparations for the next Games take shape with innovative venues and sustainability focus.',
      content: 'The host city for the 2028 Olympic Games has unveiled ambitious plans for the event, with a focus on sustainability, innovation, and creating a lasting legacy. The preparations promise to deliver a Games like no other.',
      image_url: 'https://images.unsplash.com/photo-1461896836934-ffe587ba6211?w=800',
      category: 'Olympics',
      author: 'Editor',
      created_at: Date.now() - 18000000,
    },
    {
      id: 'sample-6',
      title: 'Boxing: Unified Title Fight Breaks Pay-Per-View Records',
      summary: 'The highly anticipated bout delivers drama and record-breaking numbers.',
      content: 'The unified heavyweight championship fight broke pay-per-view records, delivering a night of drama that lived up to the hype. The bout showcased the very best of boxing and cemented the legacy of the champion.',
      image_url: 'https://images.unsplash.com/photo-1511545459752-6146d29d4c9b?w=800',
      category: 'Boxing',
      author: 'Editor',
      created_at: Date.now() - 21600000,
    },
  ];
}

// ============ LANDING PAGE HTML ============

function landingHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>otxto — Sports News & Analysis</title>
  <meta name="description" content="Your source for the latest sports news, analysis, and commentary.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='64' height='64' fill='none'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23009A44'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --green: #009A44;
      --green-dark: #007a35;
      --green-light: #e6f7ee;
      --bg: #0a0a0a;
      --card-bg: #141414;
      --card-border: #222;
      --text: #f0f0f0;
      --text-muted: #888;
      --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }
    a { color: inherit; text-decoration: none; }

    /* Header */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10,10,10,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--card-border);
      padding: 16px 0;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .logo svg { width: 28px; height: 28px; }
    .logo span { color: var(--green); }
    nav ul {
      display: flex;
      gap: 28px;
      list-style: none;
    }
    nav a {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
      transition: color 0.2s;
    }
    nav a:hover { color: var(--text); }
    .header-cta {
      background: var(--green);
      color: #fff;
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .header-cta:hover { background: var(--green-dark); }

    /* Hero */
    .hero {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 24px 40px;
      text-align: center;
    }
    .hero h1 {
      font-size: clamp(36px, 6vw, 64px);
      font-weight: 800;
      letter-spacing: -2px;
      line-height: 1.05;
      margin-bottom: 20px;
    }
    .hero h1 .accent { color: var(--green); }
    .hero p {
      font-size: clamp(16px, 2vw, 20px);
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto 32px;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      background: var(--green);
      color: #fff;
      padding: 14px 32px;
      border-radius: 100px;
      font-size: 16px;
      font-weight: 600;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-primary:hover { background: var(--green-dark); }
    .btn-primary:active { transform: scale(0.97); }
    .btn-secondary {
      background: transparent;
      color: var(--text);
      padding: 14px 32px;
      border-radius: 100px;
      font-size: 16px;
      font-weight: 600;
      border: 1px solid var(--card-border);
      transition: border-color 0.2s;
    }
    .btn-secondary:hover { border-color: var(--text-muted); }

    /* Category Pills */
    .categories {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .category-pill {
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .category-pill:hover, .category-pill.active {
      background: var(--green);
      color: #fff;
      border-color: var(--green);
    }

    /* Articles Grid */
    .articles-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    .section-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 24px;
      letter-spacing: -0.5px;
    }
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
    }
    .article-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
      cursor: pointer;
    }
    .article-card:hover {
      transform: translateY(-4px);
      border-color: var(--green);
    }
    .article-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      background: #1a1a1a;
    }
    .article-body {
      padding: 20px;
    }
    .article-category {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--green);
      margin-bottom: 8px;
    }
    .article-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .article-summary {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .article-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .article-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-muted); }

    /* Featured Article */
    .featured-article {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    .featured-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      overflow: hidden;
      display: grid;
      grid-template-columns: 1fr 1fr;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .featured-card:hover { border-color: var(--green); }
    .featured-image {
      width: 100%;
      height: 100%;
      min-height: 300px;
      object-fit: cover;
    }
    .featured-body {
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .featured-body .article-category { font-size: 13px; }
    .featured-body h2 {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .featured-body p {
      font-size: 16px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--card-border);
      padding: 40px 24px;
      margin-top: 60px;
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .footer-inner p { color: var(--text-muted); font-size: 14px; }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { color: var(--text-muted); font-size: 14px; transition: color 0.2s; }
    .footer-links a:hover { color: var(--text); }

    /* Responsive */
    @media (max-width: 768px) {
      nav ul { display: none; }
      .featured-card { grid-template-columns: 1fr; }
      .featured-image { min-height: 200px; }
      .featured-body { padding: 24px; }
      .articles-grid { grid-template-columns: 1fr; }
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 60px;
      color: var(--text-muted);
      font-size: 16px;
    }
    .spinner {
      display: inline-block;
      width: 32px;
      height: 32px;
      border: 3px solid var(--card-border);
      border-top-color: var(--green);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Article Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .modal-overlay.active { display: flex; }
    .modal {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      max-width: 700px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      padding: 40px;
    }
    .modal img {
      width: 100%;
      height: 280px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .modal h2 { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
    .modal .modal-meta { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
    .modal .modal-content { font-size: 16px; line-height: 1.7; color: #ccc; }
    .modal-close {
      position: sticky;
      top: 0;
      float: right;
      background: var(--card-border);
      border: none;
      color: var(--text);
      width: 36px; height: 36px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-close:hover { background: #333; }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009A44"/>
        </svg>
        otx<span>to</span>
      </a>
      <nav>
        <ul>
          <li><a href="#">Football</a></li>
          <li><a href="#">Basketball</a></li>
          <li><a href="#">Tennis</a></li>
          <li><a href="#">Motorsport</a></li>
          <li><a href="#">Olympics</a></li>
        </ul>
      </nav>
      <a href="/?section=cms" class="header-cta">Admin</a>
    </div>
  </header>

  <section class="hero">
    <h1>Where the game <span class="accent">never stops</span></h1>
    <p>Breaking news, expert analysis, and in-depth coverage across football, basketball, tennis, motorsport, and more.</p>
    <div class="hero-actions">
      <a href="#articles" class="btn-primary">Read Latest Stories</a>
      <a href="/?section=cms" class="btn-secondary">Manage Content</a>
    </div>
  </section>

  <div class="categories" id="categories">
    <div class="category-pill active" data-cat="all">All</div>
    <div class="category-pill" data-cat="Football">Football</div>
    <div class="category-pill" data-cat="Basketball">Basketball</div>
    <div class="category-pill" data-cat="Tennis">Tennis</div>
    <div class="category-pill" data-cat="Motorsport">Motorsport</div>
    <div class="category-pill" data-cat="Boxing">Boxing</div>
    <div class="category-pill" data-cat="Olympics">Olympics</div>
  </div>

  <section class="featured-article" id="featured"></section>

  <section class="articles-section" id="articles">
    <h2 class="section-title">Latest Stories</h2>
    <div id="articles-grid" class="articles-grid">
      <div class="loading">
        <div class="spinner"></div>
        Loading articles...
      </div>
    </div>
  </section>

  <footer>
    <div class="footer-inner">
      <p>&copy; 2026 otxto.org — Sports News &amp; Analysis</p>
      <div class="footer-links">
        <a href="/">Home</a>
        <a href="/?section=cms">Admin</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
    </div>
  </footer>

  <!-- Article Modal -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal" id="modal-content">
      <button class="modal-close" onclick="closeModal()">&times;</button>
      <div id="modal-body"></div>
    </div>
  </div>

  <script>
    let allArticles = [];
    let activeCategory = 'all';

    async function loadArticles() {
      try {
        const resp = await fetch('/api/articles?limit=20');
        const data = await resp.json();
        allArticles = data.articles || [];
        renderArticles();
      } catch (e) {
        console.error('Failed to load articles:', e);
      }
    }

    function timeAgo(ts) {
      const diff = Date.now() - ts;
      const h = Math.floor(diff / 3600000);
      if (h < 1) return Math.floor(diff / 60000) + 'm ago';
      if (h < 24) return h + 'h ago';
      return Math.floor(h / 24) + 'd ago';
    }

    function renderArticles() {
      // Featured article (first one)
      const featured = allArticles[0];
      const featuredEl = document.getElementById('featured');
      if (featured) {
        featuredEl.innerHTML = \`
          <div class="featured-card" onclick="openArticle('\${featured.id}')">
            <img class="featured-image" src="\${featured.image_url || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'}" alt="\${featured.title}" />
            <div class="featured-body">
              <span class="article-category">\${featured.category}</span>
              <h2>\${featured.title}</h2>
              <p>\${featured.summary}</p>
              <div class="article-meta">
                <span>\${featured.author || 'Editor'}</span>
                <span class="dot"></span>
                <span>\${timeAgo(featured.created_at)}</span>
              </div>
            </div>
          </div>
        \`;
      }

      // Grid (remaining articles)
      const grid = document.getElementById('articles-grid');
      const filtered = activeCategory === 'all'
        ? allArticles.slice(1)
        : allArticles.filter(a => a.category === activeCategory);

      if (filtered.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted);padding:40px;text-align:center;">No articles in this category yet.</p>';
        return;
      }

      grid.innerHTML = filtered.map(a => \`
        <div class="article-card" onclick="openArticle('\${a.id}')">
          <img class="article-image" src="\${a.image_url || 'https://images.unsplash.com/photo-1461896836934-ffe587ba6211?w=800'}" alt="\${a.title}" />
          <div class="article-body">
            <span class="article-category">\${a.category}</span>
            <h3 class="article-title">\${a.title}</h3>
            <p class="article-summary">\${a.summary}</p>
            <div class="article-meta">
              <span>\${a.author || 'Editor'}</span>
              <span class="dot"></span>
              <span>\${timeAgo(a.created_at)}</span>
            </div>
          </div>
        </div>
      \`).join('');
    }

    function openArticle(id) {
      const article = allArticles.find(a => a.id === id);
      if (!article) return;
      document.getElementById('modal-body').innerHTML = \`
        <img src="\${article.image_url || 'https://images.unsplash.com/photo-1461896836934-ffe587ba6211?w=800'}" alt="\${article.title}" />
        <span class="article-category">\${article.category}</span>
        <h2>\${article.title}</h2>
        <div class="modal-meta">By \${article.author || 'Editor'} &bull; \${timeAgo(article.created_at)}</div>
        <div class="modal-content">\${article.content}</div>
      \`;
      document.getElementById('modal-overlay').classList.add('active');
    }

    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('active');
    }

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Category filtering
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.dataset.cat;
        renderArticles();
      });
    });

    loadArticles();
  </script>
</body>
</html>`;
}

// ============ CMS ADMIN PANEL HTML ============

function cmsAdminHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>otxto — CMS Admin</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='64' height='64' fill='none'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23009A44'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --green: #009A44;
      --green-dark: #007a35;
      --bg: #0a0a0a;
      --card-bg: #141414;
      --card-border: #222;
      --text: #f0f0f0;
      --text-muted: #888;
      --font: 'Plus Jakarta Sans', sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }
    body { font-family: var(--font); background: var(--bg); color: var(--text); min-height: 100vh; }

    /* Header */
    .admin-header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--card-border);
      padding: 16px 0;
    }
    .admin-header-inner {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .admin-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 800;
    }
    .admin-logo svg { width: 24px; height: 24px; }
    .admin-logo span { color: var(--green); }
    .admin-nav { display: flex; gap: 16px; align-items: center; }
    .admin-nav a {
      font-size: 14px;
      color: var(--text-muted);
      transition: color 0.2s;
    }
    .admin-nav a:hover { color: var(--text); }

    /* Layout */
    .admin-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .admin-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 8px;
    }
    .admin-subtitle {
      color: var(--text-muted);
      font-size: 16px;
      margin-bottom: 32px;
    }

    /* Form */
    .form-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 40px;
    }
    .form-card h2 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 24px;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text-muted);
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text);
      font-family: var(--font);
      font-size: 15px;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--green);
    }
    .form-group textarea { resize: vertical; min-height: 120px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn-save {
      background: var(--green);
      color: #fff;
      border: none;
      padding: 12px 28px;
      border-radius: 100px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-save:hover { background: var(--green-dark); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Articles list */
    .articles-list { display: flex; flex-direction: column; gap: 12px; }
    .article-row {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .article-row-info { flex: 1; min-width: 0; }
    .article-row-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .article-row-meta {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .article-row-cat {
      background: var(--green);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .article-row-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .btn-icon {
      width: 36px; height: 36px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: var(--bg);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.2s;
    }
    .btn-icon:hover { color: var(--text); border-color: var(--text-muted); }
    .btn-icon.danger:hover { color: #e74c3c; border-color: #e74c3c; }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--green);
      color: #fff;
      padding: 14px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 8px 32px rgba(0,154,68,0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s;
      z-index: 300;
    }
    .toast.show { transform: translateY(0); opacity: 1; }
    .toast.error { background: #e74c3c; box-shadow: 0 8px 32px rgba(231,76,60,0.3); }

    /* DB Warning */
    .db-warning {
      background: #1a1a0a;
      border: 1px solid #444400;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      font-size: 14px;
      color: #ffcc00;
    }
    .db-warning code {
      font-family: var(--mono);
      font-size: 13px;
      background: rgba(255,204,0,0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
      .article-row { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="admin-header">
    <div class="admin-header-inner">
      <div class="admin-logo">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#009A44"/>
        </svg>
        otx<span>to</span> <span style="color:var(--text-muted);font-weight:400;font-size:14px;">/ CMS</span>
      </div>
      <div class="admin-nav">
        <a href="/">View Site &rarr;</a>
      </div>
    </div>
  </div>

  <div class="admin-container">
    <h1 class="admin-title">Content Management</h1>
    <p class="admin-subtitle">Create, edit, and manage your sports articles.</p>

    <div class="db-warning" id="db-warning" style="display:none;">
      <strong>D1 database not configured.</strong> Articles are showing sample data. To enable the CMS, create a D1 database and run the migration SQL. See <code>README.md</code> for instructions.
    </div>

    <!-- Create/Edit Form -->
    <div class="form-card">
      <h2 id="form-title">New Article</h2>
      <form id="article-form">
        <input type="hidden" id="article-id" />
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" placeholder="Enter article title..." required />
        </div>
        <div class="form-group">
          <label for="summary">Summary</label>
          <textarea id="summary" placeholder="Brief summary for the article card..." rows="2"></textarea>
        </div>
        <div class="form-group">
          <label for="content">Content</label>
          <textarea id="content" placeholder="Full article content..." rows="6"></textarea>
        </div>
        <div class="form-group">
          <label for="image_url">Image URL</label>
          <input type="url" id="image_url" placeholder="https://..." />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category">
              <option value="Football">Football</option>
              <option value="Basketball">Basketball</option>
              <option value="Tennis">Tennis</option>
              <option value="Motorsport">Motorsport</option>
              <option value="Boxing">Boxing</option>
              <option value="Olympics">Olympics</option>
              <option value="General">General</option>
            </select>
          </div>
          <div class="form-group">
            <label for="author">Author</label>
            <input type="text" id="author" placeholder="Author name" value="Admin" />
          </div>
        </div>
        <button type="submit" class="btn-save" id="btn-save">Publish Article</button>
      </form>
    </div>

    <!-- Articles List -->
    <h2 style="font-size:20px;font-weight:700;margin-bottom:16px;">Published Articles</h2>
    <div class="articles-list" id="articles-list">
      <div style="color:var(--text-muted);padding:20px;">Loading...</div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    let editingId = null;

    async function loadArticles() {
      try {
        const resp = await fetch('/api/articles?limit=50');
        const data = await resp.json();
        renderArticlesList(data.articles || []);
        if (data.articles && data.articles[0] && data.articles[0].id === 'sample-1') {
          document.getElementById('db-warning').style.display = 'block';
        }
      } catch (e) {
        document.getElementById('articles-list').innerHTML = '<div style="color:#e74c3c;padding:20px;">Failed to load articles.</div>';
      }
    }

    function renderArticlesList(articles) {
      const list = document.getElementById('articles-list');
      if (articles.length === 0) {
        list.innerHTML = '<div style="color:var(--text-muted);padding:20px;">No articles yet. Create one above!</div>';
        return;
      }
      list.innerHTML = articles.map(a => \`
        <div class="article-row">
          <div class="article-row-info">
            <div class="article-row-title">\${a.title}</div>
            <div class="article-row-meta">
              <span class="article-row-cat">\${a.category}</span>
              <span>\${a.author || 'Admin'}</span>
            </div>
          </div>
          <div class="article-row-actions">
            <button class="btn-icon" onclick="editArticle('\${a.id}')" title="Edit">&#9998;</button>
            <button class="btn-icon danger" onclick="deleteArticle('\${a.id}')" title="Delete">&times;</button>
          </div>
        </div>
      \`).join('');
    }

    document.getElementById('article-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-save');
      btn.disabled = true;
      btn.textContent = 'Saving...';

      const payload = {
        title: document.getElementById('title').value,
        summary: document.getElementById('summary').value,
        content: document.getElementById('content').value,
        image_url: document.getElementById('image_url').value,
        category: document.getElementById('category').value,
        author: document.getElementById('author').value,
      };

      try {
        const url = editingId ? '/api/articles/' + editingId : '/api/articles';
        const method = editingId ? 'PUT' : 'POST';
        const resp = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await resp.json();

        if (data.success) {
          showToast(editingId ? 'Article updated!' : 'Article published!');
          resetForm();
          loadArticles();
        } else {
          showToast(data.error || 'Failed to save', true);
        }
      } catch (e) {
        showToast('Network error', true);
      }
      btn.disabled = false;
      btn.textContent = editingId ? 'Update Article' : 'Publish Article';
    });

    async function editArticle(id) {
      const resp = await fetch('/api/articles?limit=50');
      const data = await resp.json();
      const article = (data.articles || []).find(a => a.id === id);
      if (!article) return;

      editingId = id;
      document.getElementById('article-id').value = id;
      document.getElementById('title').value = article.title;
      document.getElementById('summary').value = article.summary || '';
      document.getElementById('content').value = article.content || '';
      document.getElementById('image_url').value = article.image_url || '';
      document.getElementById('category').value = article.category || 'General';
      document.getElementById('author').value = article.author || 'Admin';
      document.getElementById('form-title').textContent = 'Edit Article';
      document.getElementById('btn-save').textContent = 'Update Article';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function deleteArticle(id) {
      if (!confirm('Delete this article?')) return;
      try {
        await fetch('/api/articles/' + id, { method: 'DELETE' });
        showToast('Article deleted');
        loadArticles();
      } catch (e) {
        showToast('Failed to delete', true);
      }
    }

    function resetForm() {
      editingId = null;
      document.getElementById('article-form').reset();
      document.getElementById('article-id').value = '';
      document.getElementById('author').value = 'Admin';
      document.getElementById('form-title').textContent = 'New Article';
      document.getElementById('btn-save').textContent = 'Publish Article';
    }

    function showToast(msg, isError) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.className = 'toast show' + (isError ? ' error' : '');
      setTimeout(() => toast.className = 'toast' + (isError ? ' error' : ''), 3000);
    }

    loadArticles();
  </script>
</body>
</html>`;
}
