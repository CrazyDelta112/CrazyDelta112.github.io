document.addEventListener('DOMContentLoaded', () => {
  loadArchive();
});

let categories = [];
let files = [];
let gamesSet = new Set();
let currentSort = { field: 'title', ascending: true };

const gameFilter = document.getElementById('gameFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const filesGrid = document.getElementById('filesGrid');

async function loadArchive() {
  filesGrid.innerHTML = '<div class="loading">Loading archive...</div>';
  try {
    const res = await fetch('/Data/files.json');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    categories = data.categories || [];
    files = data.files || [];

    // Define um placeholder enquanto buscamos os tamanhos reais
    files.forEach(file => {
      gamesSet.add(file.game);
      file.size = '...';   // substitui qualquer valor temporário
    });

    populateFilters();
    renderFiles();

    // Inicia a obtenção dos tamanhos e re‑renderiza ao final
    await fetchAllFileSizes(files);
    renderFiles();
  } catch (err) {
    console.error(err);
    filesGrid.innerHTML = '<div class="loading">ERROR 1204: Could not load archive.</div>';
  }
}

function populateFilters() {
  const sortedGames = Array.from(gamesSet).sort();
  gameFilter.innerHTML = '<option value="all">All Games</option>' + sortedGames.map(g => `<option value="${g}">${g}</option>`).join('');
  categoryFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
  gameFilter.addEventListener('change', renderFiles);
  categoryFilter.addEventListener('change', renderFiles);
  searchInput.addEventListener('input', renderFiles);
}

function getCategoryIconHtml(categoryName) {
  const cat = categories.find(c => c.name === categoryName);
  if (cat && cat.iconUrl) {
    return `<img src="${cat.iconUrl}" alt="${cat.name}" class="category-icon" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\\'fas fa-folder\\'></i>'">`;
  }
  return '<i class="fas fa-folder"></i>';
}

function renderFiles() {
  const selectedGame = gameFilter.value;
  const selectedCategory = categoryFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  let filtered = files.filter(file => {
    const matchGame = selectedGame === 'all' || file.game === selectedGame;
    const matchCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchSearch = file.title.toLowerCase().includes(searchTerm) ||
                        file.description.toLowerCase().includes(searchTerm);
    return matchGame && matchCategory && matchSearch;
  });

  if (currentSort.field) {
    filtered.sort((a, b) => {
      let valA = a[currentSort.field] || '';
      let valB = b[currentSort.field] || '';
      if (currentSort.field === 'size') {
        valA = parseSize(valA);
        valB = parseSize(valB);
      }
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return currentSort.ascending ? -1 : 1;
      if (valA > valB) return currentSort.ascending ? 1 : -1;
      return 0;
    });
  }

  if (filtered.length === 0) {
    filesGrid.innerHTML = '<div class="no-results">No files found. Try different filters.</div>';
    return;
  }

  let sortHeader = `
    <div class="sort-header">
      <span data-sort="title" class="${currentSort.field === 'title' ? 'active' : ''}">Name ${currentSort.field === 'title' ? (currentSort.ascending ? '▲' : '▼') : ''}</span>
      <span data-sort="date" class="${currentSort.field === 'date' ? 'active' : ''}">Date ${currentSort.field === 'date' ? (currentSort.ascending ? '▲' : '▼') : ''}</span>
      <span data-sort="size" class="${currentSort.field === 'size' ? 'active' : ''}">Size ${currentSort.field === 'size' ? (currentSort.ascending ? '▲' : '▼') : ''}</span>
      <span style="flex:1;"></span>
      <span>Download</span>
    </div>
  `;

  let rows = filtered.map(file => {
    const iconHtml = getCategoryIconHtml(file.category);

    let metaHtml = `<span><i class="fas fa-database"></i> ${file.size || 'N/A'}</span>`;
    if (file.credits) {
      metaHtml += `<span><i class="fas fa-user"></i> Credits: ${escapeHtml(file.credits)}</span>`;
    }

    return `
      <div class="file-card glass">
        <div class="file-icon">
          ${iconHtml}
        </div>
        <div class="file-info">
          <div class="file-title">${escapeHtml(file.title)}</div>
          <div class="file-meta">
            ${metaHtml}
          </div>
          <div class="file-desc">${escapeHtml(file.description)}</div>
          <div class="file-badges">
            <span class="badge">${escapeHtml(file.game)}</span>
            <span class="badge">${escapeHtml(file.category)}</span>
          </div>
          <a href="${file.downloadUrl}" class="download-btn" download="${file.downloadName || ''}">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      </div>
    `;
  }).join('');

  filesGrid.innerHTML = sortHeader + rows;

  document.querySelectorAll('.sort-header span[data-sort]').forEach(el => {
    el.addEventListener('click', () => {
      const field = el.dataset.sort;
      if (currentSort.field === field) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.field = field;
        currentSort.ascending = true;
      }
      renderFiles();
    });
  });
}

/* ---------- NOVAS FUNÇÕES PARA TAMANHO AUTOMÁTICO ---------- */

/**
 * Busca o tamanho de um arquivo via requisição HEAD.
 * @param {Object} file - Objeto com downloadUrl, size e outros dados.
 */
async function fetchFileSize(file) {
  try {
    const response = await fetch(file.downloadUrl, { method: 'HEAD' });
    if (response.ok) {
      const contentLength = response.headers.get('Content-Length');
      if (contentLength) {
        file.size = formatBytes(parseInt(contentLength, 10));
      } else {
        // Se não houver Content-Length, mantém como 'N/A'
        file.size = file.size === '...' ? 'N/A' : file.size;
      }
    } else {
      file.size = 'N/A';
    }
  } catch (err) {
    console.warn(`Could not fetch size for ${file.title}:`, err);
    file.size = 'N/A';
  }
}

/**
 * Converte bytes em uma string legível (B, KB, MB, GB).
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Processa todos os arquivos em lotes para evitar sobrecarga de conexões.
 * @param {Array} fileList
 */
async function fetchAllFileSizes(fileList) {
  const concurrency = 5; // número de requisições simultâneas
  for (let i = 0; i < fileList.length; i += concurrency) {
    const batch = fileList.slice(i, i + concurrency);
    await Promise.all(batch.map(file => fetchFileSize(file)));
  }
}

/* ---------------------------------------------------------- */

function parseSize(str) {
  if (!str) return 0;
  const units = { 'b': 1, 'kb': 1024, 'mb': 1024**2, 'gb': 1024**3 };
  const parts = str.toLowerCase().trim().split(' ');
  if (parts.length === 2) {
    const num = parseFloat(parts[0]);
    const unit = parts[1].replace(/s$/, '');
    return num * (units[unit] || 1);
  }
  return parseFloat(str) || 0;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
}