document.addEventListener('DOMContentLoaded', () => {
  // ---------- DOM ----------
  const gameTabsEl   = document.getElementById('gameTabs');
  const seasonsGrid  = document.getElementById('seasonsGrid');
  const seasonDetail = document.getElementById('seasonDetail');
  const modal        = document.getElementById('imageModal');
  const modalImg     = document.getElementById('modalImage');

  // ---------- Estado ----------
  let gamesData       = [];
  let currentGameId   = null;
  let currentSeasonId = null;

  // ---------- Modal (seguro) ----------
  window.openModal = (src) => {
    if (!src || !modal || !modalImg) return;
    modalImg.src = src;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = () => {
    if (!modal) return;
    modal.style.display = 'none';
    if (modalImg) modalImg.src = '';
    document.body.style.overflow = '';
  };

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeModal();
  });

  // Fecha ao clicar fora da imagem (apenas se o modal existir)
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ---------- Hash ----------
  function parseHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return { gameId: null, seasonId: null };
    const parts = hash.split('/').filter(p => p !== '');
    if (parts.length >= 2 && parts[0] === 'game') {
      return { gameId: parts[1], seasonId: parts[2] || null };
    }
    return { gameId: null, seasonId: null };
  }

  function updateHash(gameId, seasonId) {
    let newHash = `#/game/${gameId}`;
    if (seasonId) newHash += `/${seasonId}`;
    if (window.location.hash !== newHash) {
      history.pushState(null, '', newHash);
    }
  }

  // ---------- Utilitários ----------
  function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return str.replace(/[&<>]/g, m => map[m] || m);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  const PLACEHOLDER = 'https://via.placeholder.com/300x200?text=No+Image';

  // ---------- Carregar dados ----------
  async function loadData() {
    seasonsGrid.innerHTML = '<div class="loading">Loading roadmaps...</div>';
    try {
      const res = await fetch('/Data/season.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.games || !Array.isArray(data.games) || data.games.length === 0) {
        throw new Error('Invalid data structure');
      }
      gamesData = data.games;

      const { gameId, seasonId } = parseHash();
      if (gameId && gamesData.find(g => g.id === gameId)) {
        currentGameId = gameId;
        currentSeasonId = seasonId;
      } else {
        currentGameId = gamesData[0].id;
        currentSeasonId = null;
        updateHash(currentGameId, null);
      }

      renderGameTabs();

      if (currentSeasonId) {
        const game = gamesData.find(g => g.id === currentGameId);
        if (game && game.seasons.find(s => s.id === currentSeasonId)) {
          showSeasonDetail(currentSeasonId, false);
        } else {
          currentSeasonId = null;
          updateHash(currentGameId, null);
          renderSeasonsGrid();
        }
      } else {
        renderSeasonsGrid();
      }
    } catch (err) {
      console.error(err);
      seasonsGrid.innerHTML = '<div class="error">ERROR 1204: Could not load roadmap data.</div>';
    }
  }

  // ---------- Abas de jogos ----------
  function renderGameTabs() {
    if (!gamesData.length) return;
    gameTabsEl.innerHTML = gamesData.map(game => `
      <div class="game-tab ${game.id === currentGameId ? 'active' : ''}" data-game="${game.id}">
        <img src="${game.icon}" alt="${escapeHtml(game.name)}" onerror="this.src='https://via.placeholder.com/28?text=COD'">
        <span>${escapeHtml(game.name)}</span>
      </div>
    `).join('');

    document.querySelectorAll('.game-tab').forEach(tab => {
      tab.addEventListener('click', () => selectGame(tab.dataset.game));
    });
  }

  function selectGame(gameId) {
    if (currentGameId === gameId) return;
    currentGameId = gameId;
    currentSeasonId = null;
    updateHash(currentGameId, null);
    if (seasonDetail) seasonDetail.style.display = 'none';
    if (seasonsGrid) seasonsGrid.style.display = 'grid';
    renderGameTabs();
    renderSeasonsGrid();
  }

  // ---------- Grade de temporadas ----------
  function renderSeasonsGrid() {
    const game = gamesData.find(g => g.id === currentGameId);
    if (!game || !game.seasons || game.seasons.length === 0) {
      seasonsGrid.innerHTML = '<div class="no-data">No seasons available.</div>';
      return;
    }

    seasonsGrid.innerHTML = game.seasons.map(season => `
      <div class="season-card" data-season-id="${season.id}">
        <div class="season-card-image" onclick="openModal('${escapeHtml(season.keyartImage || '')}')">
          <img src="${season.keyartImage || PLACEHOLDER}" alt="${escapeHtml(season.name)}" onerror="this.src='${PLACEHOLDER}'">
        </div>
        <div class="season-card-info">
          <div class="season-card-header">
            <span class="season-card-name">${escapeHtml(season.name)}</span>
            <span class="season-card-version">${escapeHtml(season.version || '')}</span>
          </div>
          <div class="season-card-dates">
            <span>${formatDate(season.startDate)} — ${formatDate(season.endDate)}</span>
          </div>
          <div class="season-card-features">
            ${(season.features || []).slice(0,3).map(f => `<span class="feature-tag">${escapeHtml(f)}</span>`).join('')}
          </div>
          <div class="season-card-footer">
            <button class="btn-view-details" data-season-id="${season.id}">More Details</button>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showSeasonDetail(btn.dataset.seasonId);
      });
    });
  }

  function showSeasonDetail(seasonId, updateUrl = true) {
    const game = gamesData.find(g => g.id === currentGameId);
    if (!game) return;
    const season = game.seasons.find(s => s.id === seasonId);
    if (!season) return;

    currentSeasonId = seasonId;
    if (updateUrl) updateHash(currentGameId, currentSeasonId);
    if (seasonsGrid) seasonsGrid.style.display = 'none';
    if (seasonDetail) {
      seasonDetail.style.display = 'block';
      seasonDetail.innerHTML = renderSeasonDetailHTML(season);
      seasonDetail.scrollTop = 0;
    }
  }

  function extractMaps(maps) {
    if (!maps) return { allMaps: [], warzone: [] };
    if (Array.isArray(maps)) {
      // Array simples → considera tudo como "New Maps" (pode incluir Warzone, mas fica junto)
      return { allMaps: maps, warzone: [] };
    }
    if (typeof maps === 'object') {
      const mp = Array.isArray(maps.multiplayer) ? maps.multiplayer : [];
      const gw = Array.isArray(maps.groundwar) ? maps.groundwar : [];
      const wz = Array.isArray(maps.warzone) ? maps.warzone : [];
      return { allMaps: [...mp, ...gw], warzone: wz };
    }
    return { allMaps: [], warzone: [] };
  }

  function renderItemsSection(items, title) {
    if (!items || !Array.isArray(items) || items.length === 0) return '';
    return `
      <div class="detail-section">
        <h3>${title}</h3>
        <div class="detail-grid">
          ${items.map(item => `
            <div class="detail-item ${item.reloaded ? 'reloaded' : ''}" onclick="openModal('${escapeHtml(item.image || '')}')">
              ${item.reloaded ? '<span class="reloaded-indicator">Reloaded</span>' : ''}
              <img src="${item.image || PLACEHOLDER}" alt="${escapeHtml(item.name || '')}" onerror="this.style.display='none'">
              <span class="item-name">${escapeHtml(item.name)}</span>
              ${item.sub ? `<span class="item-sub">${escapeHtml(item.sub)}</span>` : ''}
              ${item.desc ? `<div class="item-desc">${escapeHtml(item.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderSeasonDetailHTML(season) {
    const roadmapHtml = season.roadmap ? `
      <div class="detail-section">
        <h3>RoadMap</h3>
        <div style="text-align:center">
          <img src="${escapeHtml(season.roadmap)}" style="max-width:100%; cursor:pointer;" onclick="openModal('${escapeHtml(season.roadmap)}')" alt="Roadmap">
        </div>
      </div>
    ` : '';

    const { allMaps, warzone } = extractMaps(season.maps);

    const sections = [
      { data: season.modes,        title: 'New Modes' },
      { data: allMaps,             title: 'New Maps' },
      { data: season.dmz,          title: 'DMZ Updates' },
      { data: season.coop,         title: 'Co-op / Spec Ops Updates' },
      { data: warzone,             title: 'Warzone Updates' },
      { data: season.operators,    title: 'Operators' },
      { data: season.killstreaks,  title: 'Killstreaks' },
      { data: season.weapons,      title: 'Weapons' },
      { data: season.attachments,  title: 'Attachments' },
      { data: season.vehicles,     title: 'New Vehicles' },
      { data: season.extras || season.Extras, title: 'Extras' }
    ];

    let sectionsHtml = '';
    sections.forEach(sec => {
      if (sec.data && Array.isArray(sec.data) && sec.data.length > 0) {
        sectionsHtml += renderItemsSection(sec.data, sec.title);
      }
    });

    return `
      <div class="detail-header">
        <div class="detail-title">
          <h2>${escapeHtml(season.name)}</h2>
          <span class="detail-version">${escapeHtml(season.version || '')}</span>
        </div>
        <button class="detail-close" onclick="closeSeasonDetail()">✕</button>
      </div>
      ${roadmapHtml}
      ${sectionsHtml}
    `;
  }

  window.closeSeasonDetail = () => {
    if (seasonDetail) seasonDetail.style.display = 'none';
    if (seasonsGrid) seasonsGrid.style.display = 'grid';
    if (currentSeasonId) {
      currentSeasonId = null;
      updateHash(currentGameId, null);
    }
  };

  window.addEventListener('hashchange', () => {
    if (!gamesData.length) return;
    const { gameId, seasonId } = parseHash();

    if (!gameId) {
      currentGameId = gamesData[0].id;
      currentSeasonId = null;
      updateHash(currentGameId, null);
      renderGameTabs();
      renderSeasonsGrid();
      if (seasonDetail) seasonDetail.style.display = 'none';
      if (seasonsGrid) seasonsGrid.style.display = 'grid';
      return;
    }

    if (!gamesData.some(g => g.id === gameId)) return;

    if (currentGameId !== gameId) {
      currentGameId = gameId;
      currentSeasonId = null;
      renderGameTabs();
      renderSeasonsGrid();
      if (seasonDetail) seasonDetail.style.display = 'none';
      if (seasonsGrid) seasonsGrid.style.display = 'grid';
    }

    if (seasonId) {
      if (currentSeasonId !== seasonId) {
        showSeasonDetail(seasonId, false);
      }
    } else {
      if (currentSeasonId !== null) {
        closeSeasonDetail();
      }
    }
  });

  loadData();
});

//If you are reading this, you need to kill hina before she kills you. She is a dangerous