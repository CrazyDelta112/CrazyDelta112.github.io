let allNews = [];
let currentCategory = 'all';

function route() {
  const path = window.location.pathname;
  const hash = window.location.hash.slice(1);

  // Se a URL for algo como /Pages/news/article/123
  const articleMatch = path.match(/\/Pages\/news\/article\/(\d+)/);
  if (articleMatch) {
    const articleId = parseInt(articleMatch[1]);
    if (!isNaN(articleId)) {
      showArticleDetail(articleId);
      return;
    }
  }

  // Caso contrário, usa o hash (#/ ou #/article/123)
  if (hash === '' || hash === '/') {
    showListView();
  } else if (hash.startsWith('/article/')) {
    const id = parseInt(hash.split('/')[2]);
    if (!isNaN(id)) showArticleDetail(id);
    else showNotFound();
  } else {
    showNotFound();
  }
}

function showListView() {
  document.getElementById('listView').style.display = 'block';
  document.getElementById('detailView').style.display = 'none';
  if (allNews.length === 0) loadNews();
  else {
    renderCategories();
    renderNews();
  }
}

function showArticleDetail(articleId) {
  document.getElementById('listView').style.display = 'none';
  document.getElementById('detailView').style.display = 'block';
  const article = allNews.find(a => a.id === articleId);
  if (!article) {
    document.getElementById('articleContainer').innerHTML = '<div class="no-posts">Article not found.</div>';
    return;
  }
  displayArticle(article);
}

function showNotFound() {
  document.getElementById('listView').style.display = 'none';
  document.getElementById('detailView').style.display = 'block';
  document.getElementById('articleContainer').innerHTML = '<div class="no-posts">Page not found.</div>';
}

async function loadNews() {
  const grid = document.getElementById('newsGrid');
  grid.innerHTML = '<div class="loading">Loading news...</div>';
  try {
    const res = await fetch('/Data/news.json');
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    allNews = data.articles;
    renderCategories();
    renderNews();
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="no-posts">ERROR 1204: Could not load news.</div>';
  }
}

function renderCategories() {
  const categories = ['all', ...new Set(allNews.map(a => a.category))];
  const container = document.getElementById('categoryFilters');
  container.innerHTML = categories.map(cat => `
    <button class="category-btn ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
      ${cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
    </button>
  `).join('');
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      renderCategories();
      renderNews();
    });
  });
}

function renderNews() {
  const grid = document.getElementById('newsGrid');
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput?.value.toLowerCase() || '';
  let filtered = allNews.filter(a => {
    const matchCat = currentCategory === 'all' || a.category === currentCategory;
    const matchSearch = a.title.toLowerCase().includes(searchTerm) ||
                        a.description.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });
  filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-posts">No articles found.</div>';
    return;
  }
  grid.innerHTML = filtered.map(a => {
    const catClass = `category-${a.category}`;
    return `
      <div class="news-card">
        <img src="${a.image}" class="news-card-image" onerror="this.src='/Assets/Images/placeholder.png'">
        <div class="news-card-content">
          <span class="news-category ${catClass}">${a.category}</span>
          <h3 class="news-title">${escapeHtml(a.title)}</h3>
          <div class="news-date"><i class="fas fa-calendar-alt"></i> ${formatDate(a.date)}</div>
          <p class="news-description">${escapeHtml(a.description)}</p>
          <div class="news-footer">
            <span class="news-source">${escapeHtml(a.source || 'Cod-Hub')}</span>
            <a href="/Pages/news/article/${a.id}" class="read-more" data-article-id="${a.id}">Read More →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Intercepta cliques nos links "Read More"
  document.querySelectorAll('.read-more[data-article-id]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.dataset.articleId;
      // Atualiza a URL sem recarregar
      history.pushState(null, '', `/Pages/news/article/${id}`);
      showArticleDetail(parseInt(id));
    });
  });

  if (searchInput && !searchInput.listenerAdded) {
    searchInput.addEventListener('input', () => renderNews());
    searchInput.listenerAdded = true;
  }
}

function renderContentBlocks(blocks) {
  if (!blocks || !blocks.length) return '<p>No content available.</p>';
  let html = '';
  for (const block of blocks) {
    switch (block.type) {
      case 'h1': html += `<h1>${escapeHtml(block.text)}</h1>`; break;
      case 'h2': html += `<h2>${escapeHtml(block.text)}</h2>`; break;
      case 'h3': html += `<h3>${escapeHtml(block.text)}</h3>`; break;
      case 'h4': html += `<h4>${escapeHtml(block.text)}</h4>`; break;
      case 'h5': html += `<h5>${escapeHtml(block.text)}</h5>`; break;
      case 'p': html += `<p>${escapeHtml(block.text)}</p>`; break;
      case 'image':
        let floatClass = '';
        if (block.float === 'left') floatClass = 'floating-img-left';
        if (block.float === 'right') floatClass = 'floating-img-right';
        html += `<div class="image-wrapper ${floatClass}">
          <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt || '')}" onerror="this.src='/Assets/Images/placeholder.png'">
          ${block.caption ? `<div class="image-caption">${escapeHtml(block.caption)}</div>` : ''}
        </div>`;
        break;
      case 'imageGrid':
        html += `<div class="image-grid">`;
        for (const img of block.images) {
          html += `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}" onerror="this.src='/Assets/Images/placeholder.png'">`;
        }
        html += `</div>`;
        break;
      case 'ul':
        html += `<ul>`;
        for (const item of block.items) html += `<li>${escapeHtml(item)}</li>`;
        html += `</ul>`;
        break;
      case 'ol':
        html += `<ol>`;
        for (const item of block.items) html += `<li>${escapeHtml(item)}</li>`;
        html += `</ol>`;
        break;
      case 'blockquote':
        html += `<blockquote>${escapeHtml(block.text)}</blockquote>`;
        break;
    }
  }
  return html;
}

function displayArticle(article) {
  const catClass = `category-${article.category}`;
  const contentHtml = renderContentBlocks(article.contentBlocks);
  const html = `
    <div class="article-header">
      <span class="article-category ${catClass}">${article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
      <h1 class="article-title">${escapeHtml(article.title)}</h1>
      <div class="article-meta">
        <span><i class="fas fa-calendar-alt"></i> ${formatDate(article.date)}</span>
        <span><i class="fas fa-newspaper"></i> ${escapeHtml(article.source || 'NovaSix')}</span>
      </div>
    </div>
    <img src="${article.image}" class="article-image" onerror="this.src='/Assets/Images/placeholder.png'">
    <div class="article-content">
      ${contentHtml}
      ${article.link ? `<p><a href="${article.link}" class="read-more" target="_blank">Original Source →</a></p>` : ''}
    </div>
    <a href="#/" class="back-link"><i class="fas fa-arrow-left"></i> Back to News</a>
  `;
  document.getElementById('articleContainer').innerHTML = html;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Navegação do browser (botões voltar/avançar)
window.addEventListener('popstate', route);

window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', () => {
  route();
});