document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();
});

const CURRENT_PAGE =
    location.pathname.split("/").pop() || "Index.html";

const createElement = (
    tag,
    className = "",
    text = ""
) => {
    const el = document.createElement(tag);

    if (className) el.className = className;
    if (text) el.textContent = text;

    return el;
};

const setLinkAttributes = (link, data) => {
    link.href = data.href || "#";

    if (data.href === CURRENT_PAGE) {
        link.classList.add("active");
    }

    if (data.target === "_blank") {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    }

    if (data.disabled) {
        link.classList.add("disabled");
        link.style.pointerEvents = "none";
        link.style.opacity = "0.6";
    }
};

const addIcon = (parent, iconClass) => {
    if (!iconClass) return;

    const icon = createElement("i");
    icon.className = iconClass;
    parent.prepend(icon);
};

async function loadNavbar() {
    try {
        const response = await fetch("/Data/Navbar.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const nav = createElement("nav", "navbar glass");

        // Brand
        const brand = createElement("div", "navbar-brand");

        const logo = createElement("img", "logo");
        logo.src = data.brand.logo;
        logo.alt = data.brand.alt;

        brand.appendChild(logo);
        nav.appendChild(brand);

        // Links
        const ul = createElement("ul", "navbar-links");
        const fragment = document.createDocumentFragment();

        for (const item of data.items) {
            const li = createElement("li");

            const link = createElement("a", "", item.label);

            addIcon(link, item.icon);

            const hasDropdown =
                Array.isArray(item.subitems) &&
                item.subitems.length > 0;

            if (hasDropdown) {
                li.classList.add("has-dropdown");

                link.href = "javascript:void(0)";

                const arrow = createElement("i");
                arrow.className = "fas fa-chevron-down";
                link.appendChild(arrow);

                const dropdown = createElement(
                    "ul",
                    "dropdown-menu"
                );

                for (const sub of item.subitems) {
                    const subLi = createElement("li");

                    const subLink = createElement(
                        "a",
                        "",
                        sub.label
                    );

                    addIcon(subLink, sub.icon);
                    setLinkAttributes(subLink, sub);

                    subLi.appendChild(subLink);
                    dropdown.appendChild(subLi);
                }

                li.appendChild(link);
                li.appendChild(dropdown);
            } else {
                setLinkAttributes(link, item);
                li.appendChild(link);
            }

            fragment.appendChild(li);
        }

        ul.appendChild(fragment);
        nav.appendChild(ul);

        document.querySelector(".container")?.prepend(nav);
    } catch (error) {
        console.error(
            "ERROR 1102 (Navbar Load Failed):",
            error
        );
    }
}
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.createElement("div");
  footer.innerHTML = `
    <div class="footer-container">
      <img id="footer-logo" class="footer-logo" src="${getFooterLogoPath(getFooterLogoVariant())}" alt="Cod-Hub Logo">
      <div class="footer-brand">
        <p>the central hub of the Call of Duty community</p>
      </div>
      <div class="footer-stores">
        <a href="https://discord.gg/6zuVkCY7xq" class="store-link" target="_blank">Discord</a>
        <a href="/About.html" class="store-link">About</a>
      </div>
      <div class="footer-legal">
        <p><i class="fa-brands fa-discord"></i>NovaSix is an independent community project and is not affiliated with Activision.</p>
      </div>
    </div>
  `;
  document.body.appendChild(footer);

  window.addEventListener('logoChanged', (e) => {
    const { target, variant } = e.detail;
    if (target === 'navbar') {
      const navbarLogo = document.getElementById('navbar-logo');
      if (navbarLogo) navbarLogo.src = getNavbarLogoPath(variant);
    } else if (target === 'footer') {
      const footerLogo = document.getElementById('footer-logo');
      if (footerLogo) footerLogo.src = getFooterLogoPath(variant);
    }
  });
});