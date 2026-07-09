(function() {
        const guidesData = {
            "s4-mod": {
                about: "A client modification for Call of Duty®: Vanguard.",
                prerequisites: {
                    content: [
                        { type: "text", value: "About 36/100 GB of free disk space." },
                        { type: "text", value: "Windows 10/11" },
                        { type: "note", value: "Make sure your GPU drivers are updated." }
                    ]
                },
                download: {
                    content: [
                        { type: "text", value: "Go to the official IW8-Mod <a style='color: cyan;' href='https://discord.gg/demonware'>Discord Server</a> and access the <code>#mod-dll</code> channel. Then click on the <code>version.dll</code>." },
                        { type: "image", src: "/Assets/Images/Mods_G/S4_TUT_1.png" },
                        { type: "text", value: "After that, you need to install the files to start the game <code>(Start Bat & geirdriful.sys)</code>." },
                        { type: "image", src: "/Assets/Images/Mods_G/S4_TUT_2.png" },
                        { type: "note", value: "The richochet bypass will only be used on 1.24 and higher." }
                    ]
                },
                installation: {
                    content: [
                        { type: "text", value: "Place <code>version.dll</code>, <code>brynhildr.sys</code> & <code>start.bat</code> in the game directory." },
                        { type: "image", src: "/Assets/Images/Mods_G/S4_TUT_3.png" },
                        { type: "text", value: "Run the <code>start.bat</code> file to launch the game." },
                        { type: "note", value: "To start versions under 1.24 run <code>Vanguard.exe</code> instead of <code>start.bat</code>." }
                    ]
                },
                playing: {
                    content: [
                        { type: "text", value: "You can play the game with bots, but there's an option to play with your friends via LAN." },
                        { type: "text", value: "To play on a <strong>LAN</strong> session you need to join the <strong>IW8-Mod Radmin server.</strong>" },
                        { type: "text", value: "Open your Radmin and search for the IW8-Mod Radmin." },
                        { type: "image", src: "/Assets/Images/Mods_G/IW8_TUT_5.png" },
                        { type: "text", value: "Copy your friend Radmin IP" },
                        { type: "text", value: "Then use the connect dvar: <code>connect [IP]</code>" }
                    ]
                },
                officialLink: "https://iw8.dev"
            },
            "iw8m": {
                about: "A client modification for Call of Duty®: Modern Warfare® (2019).",
                prerequisites: {
                    content: [
                        { type: "text", value: "Version 1.41, 1.60 or 1.64 of Modern Warfare 2019." },
                        { type: "text", value: "About 90/200 GB of free disk space." },
                        { type: "text", value: "Windows 10/11" },
                        { type: "note", value: "Make sure your GPU drivers are updated." }
                    ]
                },
                download: {
                    content: [
                        { type: "text", value: "Go to the official IW8-Mod <a style='color: cyan;' href='https://discord.gg/demonware'>Discord Server</a> and access the <code>#mod-dll</code> channel. Then click on the <code>version.dll</code>." },
                        { type: "image", src: "/Assets/Images/Mods_G/IW8_TUT_1.png" },
                        { type: "text", value: "After that, you need to install the files to start the game <code>(Start Bat & brynhildr.sys)</code>." },
                        { type: "image", src: "/Assets/Images/Mods_G/IW8_TUT_3.png" },
                        { type: "note", value: "For the 1.41 version, you don't need to download the <code>_StartGame.bat</code> file." }
                    ]
                },
                installation: {
                    content: [
                        { type: "text", value: "Place <code>version.dll</code>, <code>brynhildr.sys</code> & <code>start.bat</code> in the game directory." },
                        { type: "image", src: "/Assets/Images/Mods_G/IW8_TUT_2.png" },
                        { type: "text", value: "Run the <code>start.bat</code> file to launch the game." },
                        { type: "note", value: "To start 1.41 run <code>ModernWarfare.exe</code> instead of <code>start.bat</code>." }
                    ]
                },
                playing: {
                    content: [
                        { type: "text", value: "You can play the game with bots, but there's an option to play with your friends via LAN." },
                        { type: "text", value: "To play on a <strong>LAN</strong> session you need to join the <strong>IW8-Mod Radmin server.</strong>" },
                        { type: "text", value: "Open your Radmin and search for the IW8-Mod Radmin." },
                        { type: "image", src: "/Assets/Images/Mods_G/IW8_TUT_5.png" },
                        { type: "text", value: "Then open your game and use this command: <code>party_getLobbySessionInfo</code>, to get your Session ID" },
                        { type: "text", value: "But if you want to join a party you need to use this command: <code>party_joinSession [SESSION_ID]</code>" }
                    ]
                },
                troubleshooting: [
                    { q: "Game doesn't start", a: "Install the latest Visual C++ Redistributable (x64) from Microsoft." },
                    { q: "Missing DLL errors", a: "Make sure you copied all files to the game folder. Run as administrator and add an exclusion in your antivirus." }
                ],
                officialLink: "https://iw8.dev"
            }
        };

        const listView = document.getElementById('listView');
        const guideView = document.getElementById('guideView');
        const guideContent = document.getElementById('guideContent');
        const modsContainer = document.getElementById('modsContainer');
        const controlBar = document.getElementById('controlBar');
        const searchInput = document.getElementById('searchInput');
        const allBtn = document.getElementById('showAllBtn');
        const favBtn = document.getElementById('showFavoritesBtn');
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        const backBtn = document.getElementById('backToListBtn');

        let modsData = [];
        let favorites = JSON.parse(localStorage.getItem('modFavorites')) || [];
        let showFavorites = false;
        let searchTerm = '';

        function saveFavorites() {
            localStorage.setItem('modFavorites', JSON.stringify(favorites));
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
        }

        function renderMods(mods) {
            if (!mods || mods.length === 0) {
                modsContainer.innerHTML = `<div class="no-results">No mods found.</div>`;
                return;
            }

            modsContainer.innerHTML = mods.map(mod => {
                const isFavorite = favorites.includes(mod.id);
                const versionHtml = mod.version ? `<span>${escapeHtml(mod.version)}</span>` : '';
                const dateHtml = mod.date ? `<span>${escapeHtml(mod.date)}</span>` : '';
                const linksHtml = (mod.links || []).map(link => `
                    <a href="${link.url}" class="btn ${link.primary ? 'btn-primary' : ''}" target="_blank" rel="noopener noreferrer">${link.name}</a>
                `).join('');
                const starIcon = isFavorite ? 'fas' : 'far';

                return `
                    <div class="mod-card" data-id="${mod.id}">
                        <div class="mod-image">
                            <img src="${mod.image}" alt="${escapeHtml(mod.title)}" onerror="this.src='/Assets/Images/placeholder.png'">
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${mod.id}">
                                <i class="${starIcon} fa-star"></i>
                            </button>
                        </div>
                        <div class="mod-body">
                            <div class="mod-title">${escapeHtml(mod.title)}</div>
                            <div class="mod-description">${escapeHtml(mod.description)}</div>
                            <div class="mod-meta">
                                <span>${versionHtml}</span>
                                <span>${dateHtml}</span>
                            </div>
                            <div class="mod-links">${linksHtml}</div>
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.mod-card').forEach(card => {
                card.addEventListener('click', (e) => {

                  if (e.target.closest('.favorite-btn') || e.target.closest('a')) return;
                    const modId = card.dataset.id;
                    showGuide(modId);
                });
            });

            document.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    const idx = favorites.indexOf(id);
                    if (idx === -1) {
                        favorites.push(id);
                        btn.classList.add('active');
                        btn.querySelector('i').classList.remove('far');
                        btn.querySelector('i').classList.add('fas');
                    } else {
                        favorites.splice(idx, 1);
                        btn.classList.remove('active');
                        btn.querySelector('i').classList.remove('fas');
                        btn.querySelector('i').classList.add('far');
                    }
                    saveFavorites();
                    if (showFavorites) applyFilters();
                });
            });
        }

        function applyFilters() {
            let filtered = modsData;
            if (searchTerm) {
                filtered = filtered.filter(mod =>
                    mod.title.toLowerCase().includes(searchTerm) ||
                    mod.description.toLowerCase().includes(searchTerm)
                );
            }
            if (showFavorites) {
                filtered = filtered.filter(mod => favorites.includes(mod.id));
            }
            renderMods(filtered);
        }

        async function loadMods() {
            modsContainer.innerHTML = `<div class="loading">Loading mods...</div>`;
            try {
                const res = await fetch('/Data/Mods.json');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                modsData = data.mods;
                applyFilters();
            } catch (err) {
                console.error(err);
                modsContainer.innerHTML = `<div class="no-results">ERROR 1204: Could not load mods.</div>`;
            }
        }

        function renderContentArray(contentArray) {
            let html = '';
            if (!Array.isArray(contentArray)) return html;
            contentArray.forEach(item => {
                if (item.type === 'text') {
                    html += `<p>${item.value}</p>`;
                } else if (item.type === 'image') {
                    html += `<img src="${item.src}" alt="Guide image" class="guide-image small">`;
                } else if (item.type === 'note') {
                    html += `<div class="alert info"><i class="fas fa-info-circle"></i> ${item.value}</div>`;
                }
            });
            return html;
        }

        function showGuide(modId) {
            const guide = guidesData[modId];
            if (!guide) {
                guideContent.innerHTML = `
                    <div class="empty-guide">
                        <i class="fas fa-tools" style="font-size: 3rem; opacity: 0.4;"></i>
                        <p>No detailed guide is available for this mod yet.<br>Check the mod's official links for installation instructions.</p>
                    </div>`;
            } else {
                let html = '';

                html += `
                    <div class="step-panel">
                        <div class="step-header">
                            <div class="step-badge">i</div>
                            <h3>About</h3>
                        </div>
                        <p>${guide.about}</p>
                    </div>`;

                html += `
                    <div class="step-panel">
                        <div class="step-header">
                            <div class="step-badge">1</div>
                            <h3>Prerequisites</h3>
                        </div>`;
                if (guide.prerequisites) {
                    if (guide.prerequisites.content) {
                        html += renderContentArray(guide.prerequisites.content);
                    } else if (Array.isArray(guide.prerequisites)) {
                        html += `<ul>${guide.prerequisites.map(p => `<li>${p}</li>`).join('')}</ul>`;
                    }
                }
                html += `</div>`;

                html += `
                    <div class="step-panel">
                        <div class="step-header">
                            <div class="step-badge">2</div>
                            <h3>Download</h3>
                        </div>`;
                if (guide.download) {
                    if (guide.download.content) {
                        html += renderContentArray(guide.download.content);
                    } else {
                        const keys = Object.keys(guide.download).filter(k => k.startsWith('text'));
                        keys.sort().forEach(k => { html += `<p>${guide.download[k]}</p>`; });
                        if (guide.download.image) html += `<img src="${guide.download.image}" alt="Download" class="guide-image small">`;
                        if (guide.download.note) html += `<div class="alert info"><i class="fas fa-info-circle"></i> ${guide.download.note}</div>`;
                    }
                }
                html += `</div>`;

                html += `
                    <div class="step-panel">
                        <div class="step-header">
                            <div class="step-badge">3</div>
                            <h3>Installation</h3>
                        </div>`;
                if (guide.installation) {
                    if (guide.installation.content) {
                        html += renderContentArray(guide.installation.content);
                    } else if (Array.isArray(guide.installation)) {
                        html += `<ol>${guide.installation.map(step => `<li>${step}</li>`).join('')}</ol>`;
                    }
                }
                html += `</div>`;

                html += `
                    <div class="step-panel">
                        <div class="step-header">
                            <div class="step-badge">4</div>
                            <h3>How to Play</h3>
                        </div>`;
                if (guide.playing) {
                    if (guide.playing.content) {
                        html += renderContentArray(guide.playing.content);
                    } else if (Array.isArray(guide.playing)) {
                        html += `<ol>${guide.playing.map(step => `<li>${step}</li>`).join('')}</ol>`;
                    }
                }
                html += `</div>`;

                if (guide.troubleshooting && guide.troubleshooting.length > 0) {
                    html += `
                        <div class="step-panel">
                            <div class="step-header">
                                <div class="step-badge">5</div>
                                <h3>Troubleshooting</h3>
                            </div>
                            ${guide.troubleshooting.map(item => `
                                <div class="faq-item">
                                    <button class="faq-toggle">${item.q} <i class="fas fa-chevron-down"></i></button>
                                    <div class="faq-content">${item.a}</div>
                                </div>
                            `).join('')}
                        </div>`;
                }

                if (guide.officialLink) {
                    html += `
                        <div style="text-align: center; margin: 1.5rem 0;">
                            <a href="${guide.officialLink}" target="_blank" class="hash-btn" style="display: inline-block; padding: 1rem 2rem; text-decoration: none;">
                                <i class="fas fa-external-link-alt"></i> Visit Official Site
                            </a>
                        </div>`;
                }

                guideContent.innerHTML = html;

                document.querySelectorAll('.faq-toggle').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const item = btn.parentElement;
                        item.classList.toggle('open');
                    });
                });
            }

            listView.style.display = 'none';
            controlBar.classList.add('hidden');
            guideView.classList.add('active');
            window.scrollTo(0, 0);
        }

        function backToList() {
            guideView.classList.remove('active');
            listView.style.display = '';
            controlBar.classList.remove('hidden');
            guideContent.innerHTML = '';
            window.scrollTo(0, 0);
        }

        backBtn.addEventListener('click', backToList);

        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase().trim();
            applyFilters();
        });

        allBtn.addEventListener('click', () => {
            allBtn.classList.add('active');
            favBtn.classList.remove('active');
            showFavorites = false;
            applyFilters();
        });

        favBtn.addEventListener('click', () => {
            favBtn.classList.add('active');
            allBtn.classList.remove('active');
            showFavorites = true;
            applyFilters();
        });

        gridViewBtn.addEventListener('click', () => {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            modsContainer.classList.remove('list-view');
        });

        listViewBtn.addEventListener('click', () => {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            modsContainer.classList.add('list-view');
        });

        loadMods();
    })();