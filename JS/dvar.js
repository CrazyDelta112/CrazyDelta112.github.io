document.addEventListener('DOMContentLoaded', () => {
  const dvarList = document.getElementById('dvarList');
  const searchInput = document.getElementById('searchInput');
  const resultCount = document.getElementById('resultCount');
  const gameTabs = document.querySelectorAll('.game-tab');

  let currentGame = 'mw19';
  let allDvars = [];

  const gameFiles = {
    mw19: '/Assets/Files/Archived/IW8_Dvars.txt',
    mwii: '/Assets/Files/Archived/IW9_Dvars.txt'
  };

  function parseMW19(text) {
    const lines = text.split('\n');
    const dvars = [];
    const regex = /^(\S+)\s+\(([^)]+)\)\s*-\s*(.*)$/;
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const match = line.match(regex);
      if (match) {
        dvars.push({
          encrypted: match[1],
          decrypted: match[2],
          description: match[3].trim()
        });
      } else {
        const simpleMatch = line.match(/^(\S+)\s+\(([^)]+)\)/);
        if (simpleMatch) {
          dvars.push({
            encrypted: simpleMatch[1],
            decrypted: simpleMatch[2],
            description: ''
          });
        }
      }
    }
    return dvars;
  }

  function parseMWII(text) {
    const lines = text.split('\n');
    const dvars = [];
    // Exemplo: #x3C46136D9DB78C0B3 => "CDL_has_seen_restricted_loadouts_popup",
    // Pode ter descrição depois? Vamos capturar tudo após a string entre aspas (até final da linha)
    const regex = /^(#[xX][0-9A-Fa-f]+)\s*=>\s*"([^"]+)"\s*,?\s*(.*)$/;
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const match = line.match(regex);
      if (match) {
        dvars.push({
          encrypted: match[1],
          decrypted: match[2],
          description: match[3].trim().replace(/,$/, '')
        });
      } else {
        // fallback: linha com => "algo" sem #
        const simpleMatch = line.match(/^([^"]+)\s*=>\s*"([^"]+)"/);
        if (simpleMatch) {
          dvars.push({
            encrypted: simpleMatch[1].trim(),
            decrypted: simpleMatch[2],
            description: ''
          });
        }
      }
    }
    return dvars;
  }

  // ---------- LOAD & SWITCH ----------
  async function loadDvars(game) {
    dvarList.innerHTML = '<div class="loading">Loading dvars...</div>';
    try {
      const file = gameFiles[game];
      if (!file) throw new Error('Invalid game');
      const res = await fetch(file);
      if (!res.ok) throw new Error('Failed to load dvars');
      const text = await res.text();
      if (game === 'mw19') {
        allDvars = parseMW19(text);
      } else if (game === 'mwii') {
        allDvars = parseMWII(text);
      }
      if (allDvars.length === 0) throw new Error('No dvars found');
      renderDvars(allDvars);
    } catch (err) {
      console.error(err);
      dvarList.innerHTML = '<div class="no-results">ERROR: Could not load dvar data.</div>';
      resultCount.textContent = '';
    }
  }

  function selectGame(game) {
    if (currentGame === game) return;
    currentGame = game;
    // Atualiza tabs
    gameTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.game === game);
    });
    // Limpa search
    searchInput.value = '';
    loadDvars(game);
  }

  // Eventos das tabs
  gameTabs.forEach(tab => {
    tab.addEventListener('click', () => selectGame(tab.dataset.game));
  });

  // ---------- RENDER & SEARCH ----------
  function renderDvars(dvars) {
    if (dvars.length === 0) {
      dvarList.innerHTML = '<div class="no-results">No dvars match your search.</div>';
      resultCount.textContent = '';
      return;
    }
    resultCount.textContent = `${dvars.length} dvar${dvars.length !== 1 ? 's' : ''}`;

    dvarList.innerHTML = dvars.map(dvar => `
      <div class="dvar-item">
        <span class="dvar-encrypted">
          ${escapeHtml(dvar.encrypted)}
          <button class="copy-btn" title="Copy encrypted" data-copy="${escapeHtml(dvar.encrypted)}"><i class="fas fa-copy"></i></button>
        </span>
        <span class="dvar-decrypted">
          ${escapeHtml(dvar.decrypted)}
          <button class="copy-btn" title="Copy decrypted" data-copy="${escapeHtml(dvar.decrypted)}"><i class="fas fa-copy"></i></button>
        </span>
        <span class="dvar-description">${escapeHtml(dvar.description)}</span>
      </div>
    `).join('');

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
          const icon = btn.querySelector('i');
          icon.className = 'fas fa-check';
          setTimeout(() => icon.className = 'fas fa-copy', 1000);
        }).catch(err => console.error('Copy failed', err));
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return str.replace(/[&<>]/g, m => map[m] || m);
  }

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    const filtered = allDvars.filter(dvar =>
      dvar.encrypted.toLowerCase().includes(term) ||
      dvar.decrypted.toLowerCase().includes(term)
    );
    renderDvars(filtered);
  });

  // Inicia com MW2019
  loadDvars('mw19');
});