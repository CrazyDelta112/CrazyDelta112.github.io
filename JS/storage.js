document.addEventListener('DOMContentLoaded', () => {
  loadData();

  const backBtn = document.getElementById('backToGamesBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('gamesSection').style.display = 'block';
      document.getElementById('itemsSection').style.display = 'none';
      currentGame = null;
      currentCategory = 'all';
      currentPage = 1;
      updateHash(null, null); // clear hash when going back to games grid
    });
  }

  // Listen to hash changes (back/forward buttons)
  window.addEventListener('hashchange', () => {
    const { gameId, categoryId } = parseHash();
    if (gameId && games.some(g => g.id === gameId)) {
      if (currentGame !== gameId) {
        selectGame(gameId);
      }
      if (categoryId !== currentCategory) {
        currentCategory = categoryId || 'all';
        renderCategorySidebar();
        renderItems();
      }
    }
  });
});

let categories = [];
let games = [];
let allItems = [];
let currentCategory = 'all';
let currentGame = null;
let currentPage = 1;
const itemsPerPage = 12;

// ----- HASH ROUTING HELPERS -----
function parseHash() {
  const hash = window.location.hash.slice(1); // remove '#'
  if (!hash) return { gameId: null, categoryId: null };
  const parts = hash.split('/');
  if (parts.length >= 2 && parts[0] === 'game') {
    const gameId = parts[1];
    let categoryId = null;
    if (parts.length >= 4 && parts[2] === 'category') {
      categoryId = parts[3];
    }
    return { gameId, categoryId };
  }
  return { gameId: null, categoryId: null };
}

function updateHash(gameId, categoryId) {
  let newHash = '#/game/' + gameId;
  if (categoryId && categoryId !== 'all') {
    newHash += '/category/' + categoryId;
  }
  if (window.location.hash !== newHash) {
    history.pushState(null, null, newHash);
  }
}
// ----- END HASH ROUTING -----

async function loadData() {
  try {
    const response = await fetch('/Data/storage.json');
    if (!response.ok) throw new Error(`ERROR 1204: ${response.status}`);
    const data = await response.json();
    categories = data.categories || [];
    games = data.games || [];
    allItems = data.items || [];
    renderGamesGrid();
    // After games are loaded, check hash and auto‑select
    const { gameId, categoryId } = parseHash();
    if (gameId && games.some(g => g.id === gameId)) {
      selectGame(gameId);
      if (categoryId && categoryId !== 'all') {
        currentCategory = categoryId;
        renderCategorySidebar();
        renderItems();
      }
    }
  } catch (error) {
    document.getElementById('gamesGrid').innerHTML = '<div class="no-posts">ERROR 1302: Failed to load data.</div>';
  }
}

function renderGamesGrid() {
  const container = document.getElementById('gamesGrid');
  if (!container) return;
  container.innerHTML = games.map(game => `
    <div class="game-card" data-game-id="${game.id}">
      <img src="${game.image || game.icon}" class="game-card-image" onerror="this.src='/Assets/Images/placeholder.png'">
      <div class="game-card-info">
        <h3>${escapeHtml(game.name)}</h3>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => selectGame(card.dataset.gameId));
  });
}

function selectGame(gameId) {
  currentGame = gameId;
  currentPage = 1;
  currentCategory = 'all';
  updateHash(currentGame, currentCategory);
  document.getElementById('gamesSection').style.display = 'none';
  document.getElementById('itemsSection').style.display = 'block';
  
  const game = games.find(g => g.id === gameId);
  const titleSpan = document.getElementById('selectedGameTitle');
  if (titleSpan && game) titleSpan.textContent = game.name;

  renderCategorySidebar();
  renderItems();
}

function renderCategorySidebar() {
  const container = document.getElementById('categoryButtons');
  if (!container) return;

  const allIcon = '<i class="fas fa-th-large"></i>';
  let html = `
    <button class="cat-btn ${currentCategory === 'all' ? 'active' : ''}" data-category="all">
      ${allIcon} All
    </button>
  `;
  
  categories.forEach(cat => {
    const isActive = currentCategory === cat.id;
    const iconHtml = cat.icon 
      ? `<img src="${cat.icon}" alt="${cat.name}" class="cat-icon" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\'fas fa-folder\'></i>'">`
      : '<i class="fas fa-folder"></i>';
    
    html += `
      <button class="cat-btn ${isActive ? 'active' : ''}" data-category="${cat.id}">
        ${iconHtml} ${cat.name}
      </button>
    `;
  });
  
  container.innerHTML = html;
  
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      currentPage = 1;
      updateHash(currentGame, currentCategory);
      renderCategorySidebar();
      renderItems();
    });
  });
}

function getCategoryIcon(catId) {
  const icons = {
    keyart: 'fa-image',
    loading: 'fa-spinner',
    videos: 'fa-video',
    icons: 'fa-icons',
    images: 'fa-camera'
  };
  return icons[catId] || 'fa-folder';
}

function renderItems() {
  const grid = document.getElementById('itemsGrid');
  if (!grid) return;

  const filtered = allItems.filter(item => {
    const matchGame = item.game === currentGame;
    const matchCategory = currentCategory === 'all' || item.category === currentCategory;
    return matchGame && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  if (pageItems.length === 0) {
    grid.innerHTML = '<div class="no-posts">No items found.</div>';
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  grid.innerHTML = pageItems.map(item => {
    const game = games.find(g => g.id === item.game) || { name: 'Unknown', icon: '' };
    const category = categories.find(c => c.id === item.category) || { name: item.category };
    const isVideo = item.category === 'videos' || (item.image && /\.(mp4|webm|mov)$/i.test(item.image));
    return `
      <div class="item-card glass">
        <img src="${item.thumbnail}" class="item-thumbnail" loading="lazy" onerror="this.src='/Assets/Images/placeholder.png'">
        <div class="item-info">
          <h3 class="item-title">${escapeHtml(item.title)}</h3>
          <div class="item-meta">
            <span class="item-category">${escapeHtml(category.name)}</span>
            <span class="item-game"><img src="${game.icon}" alt="${game.name}" onerror="this.style.display='none'"> ${escapeHtml(game.name)}</span>
          </div>
          <p class="item-description">${escapeHtml(item.description) || ''}</p>
          <div class="item-actions">
            <a href="${item.image}" download="${item.title}.${isVideo ? 'mp4' : 'jpg'}" class="btn-download"><i class="fas fa-download"></i> Download</a>
            <button class="btn-view" onclick="viewMedia('${item.image}', ${isVideo})"><i class="fas fa-eye"></i> Preview</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('paginationContainer');
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '<div class="pagination">';
  html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="prev">❮</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="next">❯</button>`;
  html += '</div>';
  container.innerHTML = html;
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const page = btn.dataset.page;
      if (page === 'prev' && currentPage > 1) currentPage--;
      else if (page === 'next' && currentPage < totalPages) currentPage++;
      else if (!isNaN(parseInt(page))) currentPage = parseInt(page);
      renderItems();
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
}

window.viewMedia = function(src, isVideo) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      ${isVideo ? `<video controls autoplay><source src="${src}" type="video/mp4"></video>` : `<img src="${src}" alt="Preview">`}
      <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
};