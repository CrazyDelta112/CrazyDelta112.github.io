// Background Image Randomizer / Randomizador de Imagens de Fundo
// Randomly selects 3 images from the jup_ui_sp collection and applies them across all pages / Seleciona aleatoriamente 3 imagens da coleção jup_ui_sp e aplica-as em todas as páginas

(function () {
    const jupImages = [
        'Images/jup_ui_sp_operator_chemical.png',
        'Images/jup_ui_sp_operator_crashsite.png',
        'Images/jup_ui_sp_operator_dam.png',
        'Images/jup_ui_sp_operator_flashback.png',
        'Images/jup_ui_sp_operator_london.png',
        'Images/jup_ui_sp_operator_military.png',
        'Images/jup_ui_sp_operator_oligarch.png',
        'Images/jup_ui_sp_operator_shippingport.png',
        'Images/jup_ui_sp_operator_silo.png',
        'Images/jup_ui_sp_operator_skyhook.png',
        'Images/jup_ui_sp_operator_winterassault.png'
    ];

    function getRandomImages() {
        try {
            const stored = localStorage.getItem('codhub_bg_images_v3');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length === 3) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('localStorage not available or invalid:', e);
        }

        // Shuffle and pick 3 random images / Embaralha e escolhe 3 imagens aleatórias
        const shuffled = [...jupImages].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        try {
            // Store for consistency across pages / Armazena para consistência entre páginas
            localStorage.setItem('codhub_bg_images_v3', JSON.stringify(selected));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }

        return selected;
    }

    function applyBackgroundImages() {
        try {
            const images = getRandomImages();
            console.log('Selected background images:', images);

            const bgLeft = document.querySelector('.bg-left');
            const bgCenter = document.querySelector('.bg-center');
            const bgRight = document.querySelector('.bg-right');

            const preloadAndApply = (element, src) => {
                if (!element || !src) return;

                const tempImage = new Image();
                tempImage.onload = function () {
                    console.log('Image loaded successfully:', src);
                    element.src = src;
                    element.style.display = 'block';
                    element.style.opacity = '0.3'; // Enforce opacity
                    element.style.zIndex = '-1';   // Enforce z-index
                };
                tempImage.onerror = function () {
                    console.error('Failed to load image:', src);
                };
                tempImage.src = src;
            };

            preloadAndApply(bgLeft, images[0]);
            preloadAndApply(bgCenter, images[1]);
            preloadAndApply(bgRight, images[2]);

        } catch (e) {
            console.error('Error applying background images:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBackgroundImages);
    } else {
        applyBackgroundImages();
    }

    window.refreshBackgroundImages = function () {
        try {
            localStorage.removeItem('codhub_bg_images_v3');
            location.reload();
        } catch (e) {
            console.error('Error refreshing background images:', e);
        }
    };
})();
