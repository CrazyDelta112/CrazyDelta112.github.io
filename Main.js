document.addEventListener('DOMContentLoaded', async () => {
  await loadNavbar();


});

// Hash

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


//  Navbar
async function loadNavbar() {
  try {
    const res = await fetch("/Navbar.json");
    if (!res.ok) throw new Error("Failed to load navbar.json");
    const data = await res.json();

    const currentPage = location.pathname.split("/").pop();

    const nav = document.createElement("nav");
    nav.className = "navbar glass";

    const brandDiv = document.createElement("div");
    brandDiv.className = "navbar-brand";
    const logo = document.createElement("img");
    logo.src = data.brand.logo;
    logo.alt = data.brand.alt;
    logo.className = "logo";
    brandDiv.appendChild(logo);
    nav.appendChild(brandDiv);

    const ul = document.createElement("ul");
    ul.className = "navbar-links";

    data.items.forEach(item => {
      const li = document.createElement("li");
      const hasSubitems = item.subitems && item.subitems.length > 0;

      const a = document.createElement("a");
      a.textContent = item.label;
      a.style.fontFamily = "HTR";

      if (hasSubitems) {
        li.className = "has-dropdown";
        a.href = "javascript:void(0)";
        const icon = document.createElement("i");
        icon.className = "fas fa-chevron-down";
        a.appendChild(icon);
      } else {
        a.href = item.href;
        if (item.href === currentPage) {
          a.classList.add("active");
        }
      }

      if (item.disabled) {
        a.style.opacity = "0.6";
        a.style.pointerEvents = "none";
      }

      li.appendChild(a);

      if (hasSubitems) {
        const dropdown = document.createElement("ul");
        dropdown.className = "dropdown-menu";

        item.subitems.forEach(sub => {
          const subLi = document.createElement("li");
          const subLink = document.createElement("a");
          subLink.textContent = sub.label;
          subLink.href = sub.href || "javascript:void(0)";
          subLink.style.fontFamily = "HTR";

          if (sub.disabled) {
            subLink.style.opacity = "0.6";
            subLink.style.pointerEvents = "none";
            subLink.classList.add("disabled");
          }

          if (sub.href === currentPage) {
            subLink.classList.add("active");
          }

          subLi.appendChild(subLink);
          dropdown.appendChild(subLi);
        });

        li.appendChild(dropdown);
      }

      ul.appendChild(li);
    });

    nav.appendChild(ul);

    const container = document.querySelector(".container");
    if (container) {
      container.prepend(nav);
    } else {
      console.warn("Container not found, navbar not inserted.");
    }
  } catch (error) {
    console.error("ERROR 1102 (Navbar Load Failed):", error);
  }
}

// Splash
    const TARGET_WIDTH = 843;
    const TARGET_HEIGHT = 480;
    const PREVIEW_WIDTH = 421;
    const PREVIEW_HEIGHT = 240;

    let originalImage = null;
    let isImageLoaded = false;

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const previewCanvas = document.getElementById('previewCanvas');
    const convertBtn = document.getElementById('convertBtn');
    const errorMsg = document.getElementById('errorMsg');
    const downloadArea = document.getElementById('downloadArea');

    function showError(msg) {
      errorMsg.textContent = msg;
      setTimeout(() => { if (errorMsg.textContent === msg) errorMsg.textContent = ''; }, 4000);
    }

    function handleFile(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          originalImage = img;
          isImageLoaded = true;
          convertBtn.disabled = false;
          // Show preview
          previewArea.style.display = 'flex';
          const ctx = previewCanvas.getContext('2d');
          previewCanvas.width = PREVIEW_WIDTH;
          previewCanvas.height = PREVIEW_HEIGHT;
          ctx.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
          ctx.drawImage(img, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
          downloadArea.style.display = 'none';
          errorMsg.textContent = '';
        };
        img.onerror = () => {
          showError('Failed to load image. Try another file.');
          originalImage = null;
          isImageLoaded = false;
          convertBtn.disabled = true;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--accent-primary)';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'var(--glass-border)';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--glass-border)';
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function encodeToBMP(imageData, width, height) {
      const fileHeaderSize = 14;
      const dibHeaderSize = 40;
      const pixelDataSize = width * height * 4;
      const fileSize = fileHeaderSize + dibHeaderSize + pixelDataSize;
      const offset = fileHeaderSize + dibHeaderSize;
      
      const buffer = new ArrayBuffer(fileSize);
      const view = new DataView(buffer);
      
      view.setUint16(0, 0x4D42, true);
      view.setUint32(2, fileSize, true);
      view.setUint32(6, 0, true); 
      view.setUint32(10, offset, true);
      
      view.setUint32(14, dibHeaderSize, true);
      view.setInt32(18, width, true);
      view.setInt32(22, height, true);
      view.setUint16(26, 1, true); 
      view.setUint16(28, 32, true); 
      view.setUint32(30, 0, true);
      view.setUint32(34, pixelDataSize, true);
      view.setInt32(38, 0, true); 
      view.setInt32(42, 0, true); 
      view.setUint32(46, 0, true); 
      view.setUint32(50, 0, true); 
      
      const data = imageData.data;
      const rowSize = width * 4;
      let offsetPos = offset;
      for (let y = height - 1; y >= 0; y--) {
        const rowStart = y * rowSize;
        for (let x = 0; x < width; x++) {
          const pixelOffset = rowStart + x * 4;
          view.setUint8(offsetPos, data[pixelOffset + 2]); // Blue
          view.setUint8(offsetPos + 1, data[pixelOffset + 1]); // Green
          view.setUint8(offsetPos + 2, data[pixelOffset]); // Red
          view.setUint8(offsetPos + 3, data[pixelOffset + 3]); // Alpha
          offsetPos += 4;
        }
      }
      
      return new Blob([buffer], { type: 'image/bmp' });
    }

    convertBtn.addEventListener('click', () => {
      if (!isImageLoaded || !originalImage) {
        showError('No image loaded.');
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext('2d', { alpha: true });
      
      ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      ctx.drawImage(originalImage, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      
      const imageData = ctx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      
      try {
        const bmpBlob = encodeToBMP(imageData, TARGET_WIDTH, TARGET_HEIGHT);
        const url = URL.createObjectURL(bmpBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'splash.bmp';
        downloadLink.textContent = 'Download splash.bmp';
        downloadLink.className = 'download-btn';
        downloadLink.innerHTML = '<i class="fas fa-download"></i> Download BMP';
        
        downloadArea.innerHTML = '';
        downloadArea.appendChild(downloadLink);
        downloadArea.style.display = 'block';
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        errorMsg.textContent = '';
      } catch (err) {
        console.error(err);
        showError('Failed to create BMP. Please try another image.');
      }
    });