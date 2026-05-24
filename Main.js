// ========== MAIN.JS ==========
// well use this .js for global stuff like navbar and bla bla bla or animations for all pages

document.addEventListener('DOMContentLoaded', async () => {
  await loadNavbar();


  setBackgroundImage();
});

// ------------------------------------------------------------
//  Navbar
// ------------------------------------------------------------
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


// ------------------------------------------------------------
//  Background ( i need to recode this )
// ------------------------------------------------------------
function setBackgroundImage() {
  const backgroundMap = {
    'Index.html': '/Assets/Images/Main/Background.png',
    'Patch-Notes.html': '/Assets/Images/Main/Background.png',
    'GameStorage.html': '/Assets/Images/Main/Background.png',
    'Mods.html': '/Assets/Images/Main/Background.png',
    'Community-Post.html': '/Assets/Images/Main/Background.png',
    'Roadmap.html': '/Assets/Images/Main/Background.png',
    'Musics.html': '/Assets/Images/Main/Background.png',
    'About.html': '/Assets/Images/Main/Background.png',
    'Vehicles.html': '/Assets/Images/Main/Background.png',
    'Weapons.html': '/Assets/Images/Main/Background.png',
    default: '/Assets/Images/Main/Background.png'
  };

  const currentPage = location.pathname.split('/').pop() || 'Index.html';
  const bgImage = backgroundMap[currentPage] || backgroundMap.default;

  const bgElement = document.querySelector('.bg-full');
  if (bgElement) {
    bgElement.src = bgImage;
    bgElement.onerror = () => {
      bgElement.src = backgroundMap.default;
      console.warn(`Background image for ${currentPage} not found, using default.`);
    };
  } else {
    console.warn('Element .bg-full not found');
  }
}