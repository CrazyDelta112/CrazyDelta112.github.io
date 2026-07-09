const IV_TYPE_2 = 0x10000000233n;
const MASK = 0xFFFFFFFFFFFFFFFFn; // 2^64 - 1
const IW_BASE = 0xD86A3B09566EBAACn;
const IW_SECURE_KEY = "q6n-+7=tyytg94_*";

function hash64A(str, start, iv) {
  let hash = BigInt(start);
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    let byteToXor = 0;
    if (c >= 65 && c <= 90) { // 'A' to 'Z'
      byteToXor = 'a'.charCodeAt(0) + (c - 'A'.charCodeAt(0));
    } else if (c === 92) { // '\\'
      byteToXor = 47; // '/'
    } else {
      byteToXor = c;
    }
    hash ^= BigInt(byteToXor);
    hash = (hash * iv) & MASK;
  }
  return hash;
}

function hashScrDvar(str) {
  if (!str || str.length === 0) return 0n;
  let strLower = str.toLowerCase();
  return hash64A(`${strLower[0]}${IW_SECURE_KEY}${strLower.substring(1)}`, IW_BASE, IV_TYPE_2);
}

function toHex(value) {
  if (value === 0n) return "0x0";
  return "0x" + value.toString(16);
}

function toCbufFormat(hexHash) {
  if (hexHash === "0x0") return "#x3";
  return "#x3" + hexHash.substring(2);
}
const dvarInput = document.getElementById('dvarInput');
const hashBtn = document.getElementById('hashBtn');
const resultArea = document.getElementById('resultArea');
const hashResultSpan = document.getElementById('hashResult');
const cbufResultSpan = document.getElementById('cbufResult');
const copyHashBtn = document.getElementById('copyHashBtn');
const copyCbufBtn = document.getElementById('copyCbufBtn');
const exampleSpan = document.getElementById('example1');
const recentList = document.getElementById('recentList');
const clearRecentBtn = document.getElementById('clearRecentBtn');

let lastHashHex = "";
let lastCbuf = "";
let recentItems = [];
const MAX_RECENT = 8;

function addToRecent(dvar, hexHash, cbuf) {
  recentItems = recentItems.filter(item => item.dvar !== dvar);
  recentItems.unshift({ dvar, hexHash, cbuf });
  if (recentItems.length > MAX_RECENT) recentItems.pop();
  renderRecentList();
}

function renderRecentList() {
  if (!recentList) return;
  if (recentItems.length === 0) {
    recentList.innerHTML = '<p class="empty-recent">No recent hashes yet.</p>';
    return;
  }
  recentList.innerHTML = recentItems.map(item => `
    <div class="recent-item" data-dvar="${escapeHtml(item.dvar)}">
      <div class="recent-dvar">${escapeHtml(item.dvar)}</div>
      <div class="recent-hash">${escapeHtml(item.hexHash)}</div>
    </div>
  `).join('');
  document.querySelectorAll('.recent-item').forEach(el => {
    el.addEventListener('click', () => {
      const dvar = el.dataset.dvar;
      if (dvar) {
        dvarInput.value = dvar;
        handleHash();
      }
    });
  });
}

function clearRecent() {
  recentItems = [];
  renderRecentList();
}

function updateUI(dvar) {
  if (!dvar || dvar.trim() === "") {
    resultArea.style.display = "none";
    return;
  }
  const hash = hashScrDvar(dvar);
  const hexHash = toHex(hash);
  const cbuf = toCbufFormat(hexHash);
  
  lastHashHex = hexHash;
  lastCbuf = cbuf;
  
  hashResultSpan.textContent = hexHash;
  cbufResultSpan.textContent = cbuf;
  resultArea.style.display = "block";
  
  if (hash !== 0n && dvar.trim() !== "") {
    addToRecent(dvar, hexHash, cbuf);
  }
}
function handleHash() {
  let raw = dvarInput.value.trim();
  updateUI(raw);
}
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
}
function showTemporaryTooltip(btn, msg) {
  const original = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-check"></i> ${msg}`;
  setTimeout(() => {
    btn.innerHTML = original;
  }, 1500);
}
hashBtn.addEventListener('click', handleHash);
dvarInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleHash();
});
copyHashBtn.addEventListener('click', () => {
  if (lastHashHex) {
    navigator.clipboard.writeText(lastHashHex);
    showTemporaryTooltip(copyHashBtn, "Copied!");
  }
});
copyCbufBtn.addEventListener('click', () => {
  if (lastCbuf) {
    navigator.clipboard.writeText(lastCbuf);
    showTemporaryTooltip(copyCbufBtn, "Copied!");
  }
});
exampleSpan.addEventListener('click', () => {
  dvarInput.value = "cg_fovScale";
  handleHash();
  dvarInput.focus();
});
clearRecentBtn.addEventListener('click', () => {
  clearRecent();
});

dvarInput.value = "";
resultArea.style.display = "none";
renderRecentList();