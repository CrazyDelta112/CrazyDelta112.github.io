document.addEventListener('DOMContentLoaded', () => {
  const weaponsGrid = document.getElementById('weaponsGrid');
  const searchInput = document.getElementById('searchInput');
  const resultCount = document.getElementById('resultCount');
  const gameTabs = document.querySelectorAll('.game-tab');
  let currentGame = 'mw19';
  let allWeapons = [];

  const gameIcons = {
    mw19: '/Assets/Images/game_mw19.png',
    mwii: '/Assets/Images/game_mwii.png'
  };

  const categoryPrefixes = {
    'iw8_ar': 'Assault Rifle',
    'iw8_sm': 'Submachine',
    'iw8_sh': 'Shotgun',
    'iw8_sn': 'Sniper',
    'iw8_me': 'Melee',
    'iw8_mg': 'LMG',
    'iw8_lm': 'LMG',
    'iw8_pi': 'Pistol',
    'iw8_la': 'Launcher'
  };

  const mw19DataText = `

[https://static.wikia.nocookie.net/callofduty/images/e/ef/M4A1_HUD_Icon_MW.png/revision/latest?cb=20250604035456] - iw8_ar_mike4 - M4A1 (MW)
[https://static.wikia.nocookie.net/callofduty/images/4/44/AK-47_HUD_Icon_MW.png/revision/latest?cb=20240425032310] - iw8_ar_akilo47 - AK-47 (MW)
[https://static.wikia.nocookie.net/callofduty/images/f/fe/Oden_HUD_Icon_MW.png/revision/latest?cb=20240425035446] - iw8_ar_asierra12 - Oden (MW)
[https://static.wikia.nocookie.net/callofduty/images/e/e3/FR_5.56_HUD_Icon_MW.png/revision/latest?cb=20250604035451] - iw8_ar_falpha - FR 5.56 (MW)
[https://static.wikia.nocookie.net/callofduty/images/f/fe/M13_HUD_Icon_MW.png/revision/latest?cb=20250604035459] - iw8_ar_mcharlie - M13 (MW)
[https://static.wikia.nocookie.net/callofduty/images/2/24/Kilo_141_HUD_Icon_MW.png/revision/latest?cb=20240425033913] - iw8_ar_kilo433 - Kilo-141 (MW)
[https://static.wikia.nocookie.net/callofduty/images/f/fd/FAL_HUD_Icon_MW.png/revision/latest?cb=20240425033244] - iw8_ar_falima - FAL (MW)
[https://static.wikia.nocookie.net/callofduty/images/c/c1/FN_Scar_17_HUD_Icon_MW.png/revision/latest?cb=20250604035447] - iw8_ar_scharlie - FN Scar 17 (MW)
[https://static.wikia.nocookie.net/callofduty/images/8/87/RAM-7_HUD_Icon_MW.png/revision/latest?cb=20240425035656] - iw8_ar_tango21 - RAM-7 (MW)
[https://static.wikia.nocookie.net/callofduty/images/2/28/Grau_5.56_HUD_Icon_MW.png/revision/latest?cb=20240425033321] - iw8_ar_sierra552 - Grau 5.56 (MW)
[https://static.wikia.nocookie.net/callofduty/images/6/6c/CR-56_AMAX_HUD_Icon_MW.png/revision/latest?cb=20250604035443] - iw8_ar_galima - CR-56 AMAX (MW)
[https://static.wikia.nocookie.net/callofduty/images/d/dc/AN-94_HUD_Icon_MW.png/revision/latest?cb=20240425032320] - iw8_ar_anovember94 - AN-94 (MW)
[https://static.wikia.nocookie.net/callofduty/images/8/83/AS_VAL_HUD_Icon_MW.png/revision/latest?cb=20250604035437] - iw8_ar_valpha - AS VAL (MW)
[https://static.wikia.nocookie.net/callofduty/images/5/59/MP5_HUD_Icon_MW.png/revision/latest?cb=20250604035504] - iw8_sm_mpapa5 - MP5 (MW)
[https://static.wikia.nocookie.net/callofduty/images/3/32/PP19_Bizon_HUD_Icon_MW.png/revision/latest?cb=20250604035508] - iw8_sm_beta - PP19 Bizon (MW)
[https://static.wikia.nocookie.net/callofduty/images/4/4d/AUG_HUD_Icon_MW.png/revision/latest?cb=20240425032330] - iw8_sm_augolf - AUG (MW)
[https://static.wikia.nocookie.net/callofduty/images/9/91/P90_HUD_Icon_MW.png/revision/latest?cb=20250604035506] - iw8_sm_papa90 - P90 (MW)
[https://static.wikia.nocookie.net/callofduty/images/4/4f/MP7_HUD_Icon_MW.png/revision/latest?cb=20250604035505] - iw8_sm_mpapa7 - MP7 (MW)
[https://static.wikia.nocookie.net/callofduty/images/8/83/Uzi_HUD_Icon_MW.png/revision/latest?cb=20240425040448] - iw8_sm_uzulu - Uzi (MW)
[https://static.wikia.nocookie.net/callofduty/images/a/ad/ISO_HUD_Icon_MW.png/revision/latest?cb=20240425033846] - iw8_sm_charlie9 - ISO (MW)
[https://static.wikia.nocookie.net/callofduty/images/5/5a/Striker_45_HUD_Icon_MW.png/revision/latest?cb=20240425040437] - iw8_sm_smgolf45 - Striker 45 (MW)
[https://static.wikia.nocookie.net/callofduty/images/3/3a/Fennec_HUD_Icon_MW.png/revision/latest?cb=20250604035446] - iw8_sm_victor - Fennec (MW)
[https://static.wikia.nocookie.net/callofduty/images/c/c4/CX-9_HUD_Icon_MW.png/revision/latest?cb=20250604035444] - iw8_sm_evoskorpion - CX-9 (MW)
[https://static.wikia.nocookie.net/callofduty/images/3/3b/R9-0_Shotgun_HUD_Icon_MW.png/revision/latest?cb=20240425035647] - iw8_sh_dpapa12 - R9-0 (MW)
[https://static.wikia.nocookie.net/callofduty/images/e/e1/Origin_12_Shotgun_HUD_Icon_MW.png/revision/latest?cb=20240425035457] - iw8_sh_oscar12 - Origin 12 (MW)
[https://static.wikia.nocookie.net/callofduty/images/1/18/725_HUD_Icon_MW.png/revision/latest?cb=20250604035433] - iw8_sh_charlie725 - 725 (MW)
[https://static.wikia.nocookie.net/callofduty/images/7/75/Model_680_HUD_Icon_MW.png/revision/latest?cb=20240425034834] - iw8_sh_romeo870 - Model 680 (MW)
[https://static.wikia.nocookie.net/callofduty/images/0/04/VLK_Rogue_HUD_Icon_MW.png/revision/latest?cb=20250604035519] - iw8_sh_mike26 - VLK Rogue (MW)
[https://static.wikia.nocookie.net/callofduty/images/4/47/JAK-12_HUD_Icon_MW.png/revision/latest?cb=20250604035453] - iw8_sh_aalpha12 - JAK-12 (MW)
[https://static.wikia.nocookie.net/callofduty/images/5/58/M91_HUD_Icon_MW.png/revision/latest?cb=20240425034738] - iw8_lm_kilo121 - M91 (MW)
[https://static.wikia.nocookie.net/callofduty/images/0/02/PKM_HUD_Icon_MW.png/revision/latest?cb=20240425035509] - iw8_lm_pkilo - PKM (MW)
[https://static.wikia.nocookie.net/callofduty/images/3/31/SA87_HUD_Icon_MW.png/revision/latest?cb=20240425040414] - iw8_lm_lima86 - SA87 (MW)
[https://static.wikia.nocookie.net/callofduty/images/d/d3/MG34_HUD_Icon_MW.png/revision/latest?cb=20240425034751] - iw8_lm_mgolf34 - MG34 (MW)
[https://static.wikia.nocookie.net/callofduty/images/f/f6/Holger-26_HUD_Icon_MW.png/revision/latest?cb=20240425033833] - iw8_lm_mgolf36 - Holger-26 (MW)
[https://static.wikia.nocookie.net/callofduty/images/7/71/Bruen_Mk9_HUD_Icon_MW.png/revision/latest?cb=20250604035442] - iw8_lm_mkilo3 - Bruen MK9 (MW)
[https://static.wikia.nocookie.net/callofduty/images/5/52/FiNN_LMG_HUD_Icon_MW.png/revision/latest?cb=20240425033309] - iw8_lm_sierrax - FiNN LMG (MW)
[https://static.wikia.nocookie.net/callofduty/images/3/35/Minigun_HUD_Icon_MW.png/revision/latest?cb=20240425034804] - iw8_lm_dblmg - Minigun (MW)
[https://static.wikia.nocookie.net/callofduty/images/1/18/RAAL_MG_HUD_Icon_MW.png/revision/latest?cb=20250604035509] - iw8_lm_slima - RAAL MG (MW)
[https://static.wikia.nocookie.net/callofduty/images/8/84/EBR-14_HUD_Icon_MW.png/revision/latest?cb=20240425032834] - iw8_sn_mike14 - EBR-14 (MW)
[https://static.wikia.nocookie.net/callofduty/images/d/db/Kar98k_HUD_Icon_MW.png/revision/latest?cb=20240425033858] - iw8_sn_kilo98 - Kar98k (MW)
[https://static.wikia.nocookie.net/callofduty/images/0/03/MK2_Carbine_HUD_Icon_MW.png/revision/latest?cb=20240425034817] - iw8_sn_sbeta - Mk2 Carbine (MW)
[https://static.wikia.nocookie.net/callofduty/images/b/b5/SP-R_208_HUD_Icon_MW.png/revision/latest?cb=20250604035514] - iw8_sn_golf28 - SP-R 208 (MW)
[https://static.wikia.nocookie.net/callofduty/images/8/80/Crossbow_HUD_Icon_MW.png/revision/latest?cb=20240425032350] - iw8_sn_crossbow - Crossbow (MW)
[https://static.wikia.nocookie.net/callofduty/images/7/77/SKS_HUD_Icon_MW.png/revision/latest?cb=20240425040427] - iw8_sn_sksierra - SKS (MW)
[https://static.wikia.nocookie.net/callofduty/images/8/86/AX-50_HUD_Icon_MW.png/revision/latest?cb=20250604035438] - iw8_sn_alpha50 - AX-50 (MW)
[https://static.wikia.nocookie.net/callofduty/images/4/42/Dragunov_HUD_Icon_MW.png/revision/latest?cb=20240425032813] - iw8_sn_delta - Dragunov (MW)
[https://static.wikia.nocookie.net/callofduty/images/6/6e/HDR_HUD_Icon_MW.png/revision/latest?cb=20240425033335] - iw8_sn_hdromeo - HDR (MW)
[https://static.wikia.nocookie.net/callofduty/images/f/f8/Rytec_AMR_HUD_Icon_MW.png/revision/latest?cb=20240425040347] - iw8_sn_xmike109 - Rytec AMR (MW)
[https://static.wikia.nocookie.net/callofduty/images/a/af/X16_HUD_Icon_MW.png/revision/latest?cb=20240425040503] - iw8_pi_golf21 - X16 (MW)
[https://static.wikia.nocookie.net/callofduty/images/f/f1/M19_HUD_Icon_MW.png/revision/latest?cb=20240425033927] - iw8_pi_papa320 - M19 (MW)
[https://static.wikia.nocookie.net/callofduty/images/9/9d/.50_GS_HUD_Icon_MW.png/revision/latest?cb=20250604035429] - iw8_pi_decho - .50 GS (MW)
[https://static.wikia.nocookie.net/callofduty/images/d/de/1911_HUD_Icon_MW.png/revision/latest?cb=20240425032300] - iw8_pi_mike1911 - 1911 (MW)
[https://static.wikia.nocookie.net/callofduty/images/a/a5/.357_HUD_Icon_MW.png/revision/latest?cb=20240425032246] - iw8_pi_cpapa - .357 (MW)
[https://static.wikia.nocookie.net/callofduty/images/b/be/Renetti_HUD_Icon_MW.png/revision/latest?cb=20240425040334] - iw8_pi_mike9 - Renetti (MW)
[https://static.wikia.nocookie.net/callofduty/images/a/a3/Sykov_HUD_Icon_MW.png/revision/latest?cb=20250604035516] - iw8_pi_mike - Sykov (MW)
[https://static.wikia.nocookie.net/callofduty/images/8/85/RPG-7_HUD_Icon_MW.png/revision/latest?cb=20250604035513] - iw8_la_rpapa7 - RPG-7 (MW)
[https://static.wikia.nocookie.net/callofduty/images/c/c9/PILA_HUD_Icon_MW.png/revision/latest?cb=20250604035507] - iw8_la_gromeo - PILA (MW)
[https://static.wikia.nocookie.net/callofduty/images/2/2f/JOKR_HUD_Icon_MW.png/revision/latest?cb=20250604035454] - iw8_la_juliet - JOKR (MW)
[https://static.wikia.nocookie.net/callofduty/images/f/f3/Strela-P_HUD_Icon_MW.png/revision/latest?cb=20250604035515] - iw8_la_kgolf - Strela-P (MW)
`;

  const mwiiDataText = ``;

  function getCategory(id) {
    for (const [prefix, name] of Object.entries(categoryPrefixes)) {
      if (id.startsWith(prefix)) return name;
    }
    return 'Other';
  }

  function parseWeapons(text) {
    const lines = text.split('\n');
    const weapons = [];
    const regex = /^\[(.+?)\]\s*-\s*(\S+)\s*-\s*(.+?)\s*\((\w+)\)\s*$/;
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const match = line.match(regex);
      if (match) {
        weapons.push({
          image: match[1],
          id: match[2],
          name: match[3].trim(),
          game: match[4],
          category: getCategory(match[2])
        });
      }
    }
    return weapons;
  }

  function loadWeapons(game) {
    weaponsGrid.innerHTML = '<div class="loading">Loading weapons...</div>';
    try {
      const text = game === 'mw19' ? mw19DataText : mwiiDataText;
      allWeapons = parseWeapons(text);
      if (allWeapons.length === 0) throw new Error('No weapons found');
      renderWeapons(allWeapons);
    } catch (err) {
      console.error(err);
      weaponsGrid.innerHTML = '<div class="no-results">ERROR: Could not load weapon data.</div>';
      resultCount.textContent = '';
    }
  }

  function renderWeapons(weapons) {
    if (weapons.length === 0) {
      weaponsGrid.innerHTML = '<div class="no-results">No weapons match your search.</div>';
      resultCount.textContent = '';
      return;
    }
    resultCount.textContent = `${weapons.length} weapon${weapons.length !== 1 ? 's' : ''}`;
    const gameIconUrl = gameIcons[currentGame] || '/Assets/Images/game_default.png';

    weaponsGrid.innerHTML = weapons.map(w => `
      <div class="weapon-card">
        <div class="weapon-image">
          <img src="${escapeHtml(w.image)}" alt="${escapeHtml(w.name)}" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\\'fas fa-crosshairs\\'></i>'">
        </div>
        <div class="weapon-info">
          <div class="weapon-name">${escapeHtml(w.name)}</div>
          <div class="weapon-id">${escapeHtml(w.id)}</div>
          <div class="weapon-meta">
            <span class="weapon-category">${escapeHtml(w.category)}</span>
            <span class="weapon-game-icon" title="${escapeHtml(w.game)}">
              <img src="${escapeHtml(gameIconUrl)}" alt="${escapeHtml(w.game)}" onerror="this.style.display='none'">
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return str.replace(/[&<>]/g, m => map[m] || m);
  }

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    const filtered = allWeapons.filter(w =>
      w.name.toLowerCase().includes(term) ||
      w.id.toLowerCase().includes(term)
    );
    renderWeapons(filtered);
  });

  gameTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('disabled')) return;
      if (tab.dataset.game === currentGame) return;
      currentGame = tab.dataset.game;
      gameTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      searchInput.value = '';
      loadWeapons(currentGame);
    });
  });

  loadWeapons('mw19');
});