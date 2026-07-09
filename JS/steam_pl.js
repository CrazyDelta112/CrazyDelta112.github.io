 document.addEventListener('DOMContentLoaded', () => {
      const grid = document.getElementById('playerGrid');
      const totalCountEl = document.getElementById('totalCount');
      const refreshBtn = document.getElementById('refreshBtn');
      const errorBox = document.getElementById('errorBox');

      const games = [
        { id: '1938090', name: 'Call of Duty HQ  (BO6/BO7/WZ)', icon: 'https://cdn2.steamgriddb.com/icon/deba1b8aa887b1342b5b03f8f194548f/32/256x256.png' },
        { id: '3595270', name: 'Modern Warfare III', icon: 'https://cdn2.steamgriddb.com/icon_thumb/479c3b117877156329c2b59da92dcca1.png' },
        { id: '3595230', name: 'Modern Warfare II', icon: 'https://cdn2.steamgriddb.com/icon_thumb/8e9122fa7ac8483b423d3c591d9972a1.png' },
        { id: '1985820', name: 'Vanguard', icon: 'https://cdn2.steamgriddb.com/icon_thumb/2797bb21fe4a6b30e61faa6026def201.png' },
        { id: '1985810', name: 'Black Ops Cold War', icon: 'https://cdn2.steamgriddb.com/icon_thumb/b3f61131b6eceeb2b14835fa648a48ff.png' },
        { id: '2000950', name: 'Modern Warfare (2019)', icon: 'https://cdn2.steamgriddb.com/icon_thumb/960e22c062e54ee98c07ce83a5e39cff.png' },
        { id: '476600', name: 'Call of Duty: WWII', icon: 'https://cdn2.steamgriddb.com/icon_thumb/e2bd79902aa2c126084f080211564dc8.png' },
        { id: '292730', name: 'Call of Duty: Infinite Warfare', icon: 'https://cdn2.steamgriddb.com/icon_thumb/21b12b67cb6ff82b0d5e9e1d96d4b56c.png' },
        { id: '311210', name: 'Call of Duty: Black Ops III', icon: 'https://cdn2.steamgriddb.com/icon_thumb/e355ad06c5a89f911fbb0aff2de52435.png' },
        { id: '209650', name: 'Call of Duty: Advanced Warfare', icon: 'https://cdn2.steamgriddb.com/icon/66da29be610a622294c3366c250763e2/32/256x256.png' },
        { id: '209160', name: 'Call of Duty: Ghosts', icon: 'https://cdn2.steamgriddb.com/icon_thumb/ee4fca620799b0962f344dd8c0dbe4b2.png' },
        { id: '202970', name: 'Call of Duty: Black ops II', icon: 'https://cdn2.steamgriddb.com/icon/ef78696cd7010762dd352b66f28acf95/32/256x256.png' },
        { id: '115300', name: 'Call of Duty: Modern Warfare 3', icon: 'https://cdn2.steamgriddb.com/icon_thumb/bd1bb6b87180689231804f4ceb383485.png' },
        { id: '42700', name: 'Call of Duty: Black Ops', icon: 'https://cdn2.steamgriddb.com/icon/702f785904a60c6b8b8e5af93f9e412e/32/256x256.png' },
        { id: '10180', name: 'Call of Duty : Modern Warfare 2', icon: 'https://cdn2.steamgriddb.com/icon/4a949dbdbf7f541376465f0794bf1c47/32/256x256.png' },
        { id: '10090', name: 'Call of Duty: World At War', icon: 'https://cdn2.steamgriddb.com/icon_thumb/e6202b0662093fb1ff302e1d21c1fce3.png' },
        { id: '7940', name: 'Call of Duty 4: Modern Warfare', icon: 'https://cdn2.steamgriddb.com/icon_thumb/ee24544795bf59a8343731c3501c6b4e.png' },
        { id: '2630', name: 'Call of Duty 2', icon: 'https://cdn2.steamgriddb.com/icon_thumb/d846e38f1196eb61a7b71e1cd7a913e4.png' },
        { id: '2640', name: 'Call of Duty: United Offensive', icon: 'https://cdn2.steamgriddb.com/icon_thumb/6acb084470c0a8bdf431d5427d1f29bc.png' },
        { id: '2620', name: 'Call of Duty (2003)', icon: 'https://cdn2.steamgriddb.com/icon/5bb098377521372ff3fe2d5fdc965fa8/32/256x256.png' }
      ];

      let cache = {};
      let totalPlayers = 0;

      const CORS_PROXY = 'https://corsproxy.io/?';

      async function fetchPlayerCount(appId) {
        if (cache[appId] && (Date.now() - cache[appId].timestamp) < 30000) {
          return cache[appId].data;
        }

        try {
          const targetUrl = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}&format=json`;
          const proxyUrl = CORS_PROXY + encodeURIComponent(targetUrl);
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const text = await response.text();
          const data = JSON.parse(text);
          const count = data.response?.player_count ?? data?.player_count ?? 0;
          cache[appId] = { data: count, timestamp: Date.now() };
          return count;
        } catch (err) {
          console.warn(`Erro ao buscar app ${appId}:`, err);
          return null;
        }
      }

      async function loadAllPlayers() {
        grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-pulse"></i> Carregando dados...</div>';
        errorBox.style.display = 'none';
        totalPlayers = 0;

        try {
          const results = await Promise.all(
            games.map(async (game) => {
              const count = await fetchPlayerCount(game.id);
              return { ...game, count };
            })
          );

          renderResults(results);
        } catch (err) {
          console.error(err);
          errorBox.textContent = 'Erro ao carregar dados. Tente novamente mais tarde.';
          errorBox.style.display = 'block';
          grid.innerHTML = '<div class="no-results">Não foi possível obter os dados.</div>';
        }
      }

      function renderResults(results) {
        let html = '';
        let total = 0;

        results.forEach(game => {
          const count = game.count;
          const isOnline = count !== null && count > 0;
          const statusClass = count !== null ? (count > 0 ? 'online' : 'offline') : 'unknown';
          const displayCount = count !== null ? count.toLocaleString() : '?';
          const countClass = count !== null ? '' : 'loading';

          if (count !== null) total += count;

          html += `
            <div class="player-card glass">
              <img src="${game.icon}" class="game-icon" onerror="this.style.display='none'">
              <div class="game-name">${game.name}</div>
              <div class="game-id">App ID: ${game.id}</div>
              <div class="player-count ${countClass}">
                ${displayCount}
                <span class="label">
                  <span class="status-dot ${statusClass}"></span>
                  ${count !== null ? (count > 0 ? 'Online' : 'Offline') : 'Unavailable'}
                </span>
              </div>
              <div class="last-updated">
                ${count !== null ? `Last Update: ${new Date().toLocaleTimeString()}` : ''}
              </div>
            </div>
          `;
        });

        grid.innerHTML = html;
        totalCountEl.textContent = total.toLocaleString();
      }

      refreshBtn.addEventListener('click', () => {
        cache = {};
        loadAllPlayers();
      });

      loadAllPlayers();

      setInterval(() => {
        cache = {};
        loadAllPlayers();
      }, 120000);
    });