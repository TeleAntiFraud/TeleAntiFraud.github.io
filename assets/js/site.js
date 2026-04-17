(function () {
  const siteData = window.TAF_SITE || { publications: [], members: [], partners: [] };
  const publicationsSorted = [...siteData.publications].sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  const lang = document.body.dataset.lang || "en";
  const assetPrefix = document.body.dataset.assetPrefix || "";
  const i18n = {
    en: {
      paper: "Paper",
      showAllMembers: (count) => `Show All Members (${count})`,
      collapseMembers: "Collapse Members"
    },
    zh: {
      paper: "论文",
      showAllMembers: (count) => `展开全部成员（${count}）`,
      collapseMembers: "收起成员"
    }
  };

  function t(key, ...args) {
    const table = i18n[lang] || i18n.en;
    const value = table[key];
    return typeof value === "function" ? value(...args) : value;
  }

  function resolveAssetUrl(url) {
    if (!url) {
      return "";
    }

    if (/^(https?:)?\/\//.test(url) || url.startsWith("/") || url.startsWith("../")) {
      return url;
    }

    return `${assetPrefix}${url}`;
  }

  function normalizePath(value) {
    if (!value) {
      return "/";
    }

    return value
      .replace(/\/index\.html$/, "/")
      .replace(/index\.html$/, "/")
      .replace(/\/+$/, "/");
  }

  function syncHeaderState() {
    const currentPath = normalizePath(window.location.pathname);
    const nav = document.querySelector(".site-nav");
    let activeNavLink = null;

    document.querySelectorAll(".site-nav a").forEach((link) => {
      const linkPath = normalizePath(new URL(link.getAttribute("href"), window.location.href).pathname);
      if (linkPath === currentPath) {
        link.setAttribute("aria-current", "page");
        activeNavLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (nav && activeNavLink) {
      const currentWidth = activeNavLink.offsetWidth;
      const currentX = activeNavLink.offsetLeft;
      const previousState = window.sessionStorage.getItem("taf-nav-pill");

      if (previousState) {
        try {
          const parsed = JSON.parse(previousState);
          nav.style.setProperty("--nav-pill-width", `${parsed.width}px`);
          nav.style.setProperty("--nav-pill-x", `${parsed.x}px`);
          nav.style.setProperty("--nav-pill-opacity", "1");

          window.requestAnimationFrame(() => {
            nav.style.setProperty("--nav-pill-width", `${currentWidth}px`);
            nav.style.setProperty("--nav-pill-x", `${currentX}px`);
          });
        } catch {
          nav.style.setProperty("--nav-pill-width", `${currentWidth}px`);
          nav.style.setProperty("--nav-pill-x", `${currentX}px`);
          nav.style.setProperty("--nav-pill-opacity", "1");
        }
      } else {
        nav.style.setProperty("--nav-pill-width", `${currentWidth}px`);
        nav.style.setProperty("--nav-pill-x", `${currentX}px`);
        nav.style.setProperty("--nav-pill-opacity", "1");
      }
    }

    document.querySelectorAll(".lang-switch a").forEach((link) => {
      if (link.dataset.langLink === lang) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function enhanceLanguageSwitch() {
    const links = Array.from(document.querySelectorAll(".lang-switch a"));
    if (!links.length) {
      return;
    }

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (link.dataset.langLink === document.body.dataset.lang) {
          return;
        }

        event.preventDefault();
        const nextLang = link.dataset.langLink || lang;
        document.body.dataset.lang = nextLang;

        links.forEach((item) => {
          if (item === link) {
            item.setAttribute("aria-current", "page");
          } else {
            item.removeAttribute("aria-current");
          }
        });

        window.setTimeout(() => {
          window.location.href = link.href;
        }, 220);
      });
    });
  }

  function enhanceSiteNav() {
    const nav = document.querySelector(".site-nav");
    const links = Array.from(document.querySelectorAll(".site-nav a"));
    if (!nav || !links.length) {
      return;
    }

    links.forEach((link) => {
      link.addEventListener("click", () => {
        const activeLink = nav.querySelector('a[aria-current="page"]');
        if (!activeLink) {
          return;
        }

        window.sessionStorage.setItem(
          "taf-nav-pill",
          JSON.stringify({
            x: activeLink.offsetLeft,
            width: activeLink.offsetWidth
          })
        );
      });
    });
  }

  function slugifyPublication(item) {
    const source = (item.shortTitle || item.title || "").toLowerCase();
    return source
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function createResourceLink(label, href, className) {
    if (!href) {
      return "";
    }

    return `
      <a class="resource-link ${className}" href="${href}" target="_blank" rel="noreferrer">
        ${label}
      </a>
    `;
  }

  function renderHeroSlider() {
    const container = document.getElementById("hero-slider");
    if (!container || !siteData.publications.length) {
      return;
    }

    let currentIndex = 0;
    const slides = siteData.publications;

    container.innerHTML = `
      <div class="slider-stage">
        <div class="slider-track">
          ${slides
            .map(
              (item, index) => `
              <article class="slider-card" data-slide="${index}">
                <a class="slider-media" href="${item.links.arxiv}" target="_blank" rel="noreferrer">
                  <img src="${resolveAssetUrl(item.image)}" alt="${item.imageAlt || item.title}" decoding="async" fetchpriority="high" />
                </a>
                <div class="slider-caption">
                  <div>
                    <span class="slider-kicker">${item.venue}</span>
                    <h3>${item.shortTitle || item.title}</h3>
                    <p>${item.title}</p>
                  </div>
                  <a class="text-link" href="${item.links.arxiv}" target="_blank" rel="noreferrer">${t("paper")}</a>
                </div>
              </article>
            `
            )
            .join("")}
        </div>
      </div>
      <div class="slider-dots">
        ${slides
          .map(
            (_, index) => `
              <button
                class="slider-dot ${index === 0 ? "is-active" : ""}"
                type="button"
                data-slide-index="${index}"
                aria-label="Go to slide ${index + 1}"
              ></button>
            `
          )
          .join("")}
      </div>
    `;

    const track = container.querySelector(".slider-track");
    const dotNodes = Array.from(container.querySelectorAll("[data-slide-index]"));

    function setActiveSlide(index) {
      currentIndex = index;
      if (track) {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
      dotNodes.forEach((node, nodeIndex) => {
        node.classList.toggle("is-active", nodeIndex === currentIndex);
      });
    }

    dotNodes.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveSlide(Number(button.getAttribute("data-slide-index")));
      });
    });

    window.setInterval(() => {
      setActiveSlide((currentIndex + 1) % slides.length);
    }, 4500);
  }

  function renderPublicationPreview() {
    const container = document.getElementById("publication-preview");
    if (!container) {
      return;
    }

    container.innerHTML = siteData.publications
      .slice()
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      .map(
        (item) => `
          <article class="publication-card">
            <div class="publication-meta">
              <div class="meta-badges">
                <span class="meta-badge">${item.venue}</span>
                <span class="meta-badge">${item.status}</span>
              </div>
              <h3>${item.title}</h3>
              <p>${item.summary}</p>
            </div>
            <div class="resource-list">
              ${createResourceLink("GitHub", item.links.github, "github")}
              ${createResourceLink("arXiv", item.links.arxiv, "arxiv")}
              ${createResourceLink("HF Model", item.links.hfModel, "hf-model")}
              ${createResourceLink("HF Dataset", item.links.hfDataset, "hf-dataset")}
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderPublicationTable() {
    const container = document.getElementById("publication-table");
    if (!container) {
      return;
    }

    container.innerHTML = publicationsSorted
      .map(
        (item) => `
          <article class="publication-row" id="${slugifyPublication(item)}">
            <a class="publication-thumb" href="${item.links.arxiv}" target="_blank" rel="noreferrer">
              <img src="${resolveAssetUrl(item.image)}" alt="${item.imageAlt || item.title}" loading="lazy" decoding="async" />
            </a>
            <div class="publication-meta">
              <div class="meta-badges">
                <span class="meta-badge">${item.venue}</span>
                <span class="meta-badge">${item.year}</span>
              </div>
              <h3>${item.shortTitle || item.title}</h3>
              <p class="publication-title-line">${item.title}</p>
              <p>${item.summary}</p>
            </div>
            <div class="publication-side">
              <div class="resource-list">
                ${createResourceLink("GitHub", item.links.github, "github")}
                ${createResourceLink("arXiv", item.links.arxiv, "arxiv")}
                ${createResourceLink("HF Model", item.links.hfModel, "hf-model")}
                ${createResourceLink("HF Dataset", item.links.hfDataset, "hf-dataset")}
              </div>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderCommunityStats() {
    const memberCount = document.getElementById("member-count");
    const partnerCount = document.getElementById("partner-count");

    if (memberCount) {
      memberCount.textContent = String(siteData.members.length || 0);
    }

    if (partnerCount) {
      partnerCount.textContent = String(siteData.partners.length || 0);
    }
  }

  function renderMembers() {
    const container = document.getElementById("member-grid");
    const controls = document.getElementById("member-controls");
    if (!container) {
      return;
    }

    if (!siteData.members.length) {
      container.innerHTML = `
        <article class="empty-state">
          <h3>Member cards pending</h3>
          <p>Add GitHub usernames, avatars, roles, and profile links in <code>assets/js/data.js</code>.</p>
        </article>
      `;
      if (controls) {
        controls.innerHTML = "";
      }
      return;
    }

    const defaultVisibleCount = 8;
    let expanded = false;

    function draw() {
      const visibleMembers =
        expanded || siteData.members.length <= defaultVisibleCount
          ? siteData.members
          : siteData.members.slice(0, defaultVisibleCount);

      container.innerHTML = visibleMembers
        .map(
          (member) => `
            <a class="member-card" href="${member.url || "#"}" target="_blank" rel="noreferrer">
              <div class="member-card-base">
                <img class="member-avatar" src="${resolveAssetUrl(member.avatar || "")}" alt="${member.name}" loading="lazy" decoding="async" />
                <div class="member-summary">
                  <h3>${member.name}</h3>
                  <p>${member.handle || ""}</p>
                </div>
              </div>
              <div class="member-card-overlay">
                <strong>${member.name}</strong>
                <span>${member.role || ""}</span>
              </div>
            </a>
          `
        )
        .join("");

      if (!controls) {
        return;
      }

      if (siteData.members.length <= defaultVisibleCount) {
        controls.innerHTML = "";
        return;
      }

      controls.innerHTML = `
        <button class="button button-secondary member-toggle" type="button">
          ${expanded ? t("collapseMembers") : t("showAllMembers", siteData.members.length)}
        </button>
      `;

      controls.querySelector(".member-toggle").addEventListener("click", () => {
        expanded = !expanded;
        draw();
      });
    }

    draw();
  }

  function renderPartners() {
    const container = document.getElementById("partner-grid");
    if (!container) {
      return;
    }

    if (!siteData.partners.length) {
      container.innerHTML = `
        <article class="empty-state">
          <h3>Partner logos pending</h3>
          <p>Add institution names, outbound links, and logo text or image references in <code>assets/js/data.js</code>.</p>
        </article>
      `;
      return;
    }

    container.innerHTML = siteData.partners
      .map(
        (partner) => `
          <a class="partner-card" href="${partner.url || "#"}" target="_blank" rel="noreferrer" data-partner="${partner.slug || ""}">
            ${
              partner.logo
                ? `<img class="partner-logo-image" src="${resolveAssetUrl(partner.logo)}" alt="${partner.name}" loading="lazy" decoding="async" />`
                : `<span class="partner-logo">${partner.logoText || "LOGO"}</span>`
            }
            <h3>${partner.name}</h3>
            <p>${partner.type || ""}</p>
          </a>
        `
      )
      .join("");
  }

  syncHeaderState();
  enhanceSiteNav();
  enhanceLanguageSwitch();
  renderPublicationPreview();
  renderHeroSlider();
  renderPublicationTable();
  renderCommunityStats();
  renderMembers();
  renderPartners();
})();
