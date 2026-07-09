const codPhrases = [
    { text: "You're all on my team, nobody fights alone.", author: "Ghost", year: "2022" },
    { text: "Hijo de puta.", author: "Alejandro", year: "2022" },
    { text: "Betrayal by a friend always hurts..", author: "Ghost", year: "2022" },
    { text: "Remember, No Russian..", author: "Vladimir Makarov", year: "2016" },
    { text: "Dragovich, Kravchenko, Steiner, they all must die..", author: "Viktor Reznov", year: "1963" },
    { text: "Victory cannot be achieved without sacrifice.", author: "Viktor Reznov", year: "1963" },
    { text: "To know you're close to the end is a kind of freedom. Good time to take... inventory.", author: "Captain Price", year: "2009" },
    { text: "The numbers, Mason! What do they mean?", author: "Jason Hudson", year: "Unknown Date" },
    { text: "Fifty-thousand people used to live here. Now it's a ghost town.", author: "Captain MacMillan", year: "1996" },
    { text: "Bishop Takes Rook", author: "Russell Adler", year: "1991" },
    { text: "My name is Viktor Reznov, and I will have my revenge!", author: "Viktor Reznov", year: "1963" },
    { text: "I gonna make you into demonware..", author: "Lifix", year: "2026" },
    { text: "It's Ok, I'll See You On The Other Side.", author: "Will Irons", year: "2054" },
    { text: "What The Hell Kind Of Name Is Soap?", author: "Captain Price", year: "2011" },
    { text: "I Made My Own Crack..", author: "DarkLasterKiller", year: "2026" },
    { text: "Bravo Six, Going Dark.", author: "Captain Price", year: "2019" },
    { text: "50,000 People Used to Live Here. Now It's a Ghost Town.", author: "Captain MacMillan", year: "1996" },
    { text: "I'll be free in 24 hours... Can't say the same about you, Vaqueros.", author: "Valeria Garza", year: "2022" },
    { text: "Welcome, Graves.", author: "Farah Karim", year: "2022/23" },
    { text: "Ever heard of Vanguard?", author: "Carver Butcher", year: "Unknown Date" },
    { text: "Choices have consequences.", author: "Ghost", year: "2022"}
];

const newsData = [
    {
        "title": "IW7-Mod",
        "description": "Check out IW7-Mod, the best way to play Infinite Warfare.",
        "image": "/Assets/Images/MainPage/Rec_1.png",
        "enable_link": true,
        "link": "https://discord.com/invite/RzzXu5EVnh"
    },
    {
        "title": "The Ultimate Atlas For Call Of Duty",
        "description": "Call of Duty Atlas is a website with dvars,infos,ids and for MW, BOCW, VG, MWII and MWIII!",
        "image": "/Assets/Images/MainPage/Rec_2.png",
        "enable_link": true,
        "link": "https://atu-atlas.github.io/"
    },
    {
        "title": "Update 2.7.0",
        "description": "The latest update for NovaSix has been released, bringing new features and improvements.",
        "image": "/Assets/Images/MainPage/Rec_4.png",
        "enable_link": false,
        "link": ""
    }
];

// Seeded PRNG
function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function getDailyPhrase() {
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const rng = mulberry32(seed);
    const index = Math.floor(rng() * codPhrases.length);
    return codPhrases[index];
}

function showDailyCODQuote() {
    const p = getDailyPhrase();
    document.getElementById("cod-quote").textContent = `"${p.text}"`;
    document.getElementById("cod-quote-meta").textContent = `— ${p.author} • ${p.year}`;
}

let currentSlide = 0;
let slideInterval;

function loadNewsCarousel() {
    try {
        buildCarousel(newsData);
        startAutoSlide();
    } catch (err) {
        console.error('Carousel error:', err);
        document.getElementById('carouselSlides').innerHTML = '<div class="loading">No news available.</div>';
    }
}

function buildCarousel(news) {
    const slidesContainer = document.getElementById('carouselSlides');
    const dotsContainer = document.getElementById('carouselDots');

    // Add will-change for GPU acceleration on the moving container
    slidesContainer.style.willChange = 'transform';

    slidesContainer.innerHTML = news.map((item, index) => `
        <div class="carousel-slide" data-index="${index}" data-link="${item.link || ''}" data-enabled="${item.enable_link || false}">
            <img src="${item.image}" alt="${item.title}" onerror="this.src='/Assets/Images/placeholder.png'">
            <div class="slide-overlay">
                <div class="slide-title">${escapeHtml(item.title)}</div>
                <div class="slide-description">${escapeHtml(item.description || '')}</div>
            </div>
        </div>
    `).join('');

    dotsContainer.innerHTML = news.map((_, index) => `
        <span class="dot" data-index="${index}"></span>
    `).join('');

    // Event delegation for slides and dots to avoid multiple listeners
    slidesContainer.addEventListener('click', (e) => {
        const slide = e.target.closest('.carousel-slide');
        if (!slide) return;
        const link = slide.dataset.link;
        const enabled = slide.dataset.enabled === 'true';
        if (enabled && link) window.open(link, '_blank');
    });

    dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.dot');
        if (!dot) return;
        const index = parseInt(dot.dataset.index);
        goToSlide(index);
    });

    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => changeSlide(-1));
        nextBtn.addEventListener('click', () => changeSlide(1));
    }

    updateDots(0);
    updateSlidePosition(0);
}

function changeSlide(direction) {
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    let newIndex = currentSlide + direction;
    if (newIndex < 0) newIndex = totalSlides - 1;
    if (newIndex >= totalSlides) newIndex = 0;
    goToSlide(newIndex);
}

function goToSlide(index) {
    currentSlide = index;
    updateSlidePosition(currentSlide);
    updateDots(currentSlide);
    resetAutoSlide();
}

function updateSlidePosition(index) {
    const slidesContainer = document.getElementById('carouselSlides');
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    }
}

function updateDots(activeIndex) {
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
    });
}

function startAutoSlide() {
    slideInterval = setInterval(() => changeSlide(1), 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function initTiltEffect() {
    const glassElements = document.querySelectorAll('.glass');
    const elementData = new WeakMap();

    function updateCacheForElement(el) {
        const rect = el.getBoundingClientRect();
        elementData.set(el, {
            rect: rect,
            isHovering: false,
            animationFrame: null,
            animationCompleted: false
        });
    }

    // Initial cache
    glassElements.forEach(el => updateCacheForElement(el));

    // Update cache on window resize/debounced for performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            glassElements.forEach(el => {
                if (elementData.has(el)) {
                    const data = elementData.get(el);
                    data.rect = el.getBoundingClientRect();
                }
            });
        }, 100);
    }, { passive: true });

    window.addEventListener('scroll', () => {
        glassElements.forEach(el => {
            if (elementData.has(el)) {
                const data = elementData.get(el);
                data.rect = el.getBoundingClientRect();
            }
        });
    }, { passive: true });

    glassElements.forEach(el => {
        const data = elementData.get(el);

        el.addEventListener('animationend', () => {
            data.animationCompleted = true;
        });

        el.addEventListener('mouseenter', () => {
            data.isHovering = true;
            data.rect = el.getBoundingClientRect();
            if (data.animationCompleted) {
                el.classList.add('hover-active');
            }
        });

        el.addEventListener('mousemove', e => {
            if (!data.isHovering) return;

            if (data.animationFrame) {
                cancelAnimationFrame(data.animationFrame);
            }

            data.animationFrame = requestAnimationFrame(() => {
                const rect = data.rect;
                // Use cached rect values – no layout call
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Clamp ratios to avoid extreme rotation
                const xRatio = Math.max(-0.8, Math.min(0.8, (x - centerX) / centerX));
                const yRatio = Math.max(-0.8, Math.min(0.8, (y - centerY) / centerY));

                const rotateX = -yRatio * 3;
                const rotateY = xRatio * 3;

                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        });

        el.addEventListener('mouseleave', () => {
            data.isHovering = false;
            if (data.animationFrame) {
                cancelAnimationFrame(data.animationFrame);
                data.animationFrame = null;
            }
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    showDailyCODQuote();
    initTiltEffect();
    loadNewsCarousel();
});