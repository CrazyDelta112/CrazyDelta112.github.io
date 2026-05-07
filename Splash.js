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