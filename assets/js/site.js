(function () {
  const siteData = window.TAF_SITE || { publications: [], members: [], partners: [] };
  const comparePublications = (a, b) => {
    const left = a.sortDate || a.year || "";
    const right = b.sortDate || b.year || "";
    return String(right).localeCompare(String(left));
  };
  const publicationsSorted = [...siteData.publications].sort(comparePublications);
  const lang = document.body.dataset.lang || "en";
  const assetPrefix = document.body.dataset.assetPrefix || "";
  const i18n = {
    en: {
      paper: "Paper",
      showAllMembers: (count) => `Show All Members (${count})`,
      collapseMembers: "Collapse Members",
      schools: "Schools",
      companies: "Companies"
    },
    zh: {
      paper: "论文",
      showAllMembers: (count) => `展开全部成员（${count}）`,
      collapseMembers: "收起成员",
      schools: "合作高校",
      companies: "合作企业"
    }
  };

  const partnerNameZh = {
    ppsuc: "中国人民公安大学",
    neu: "东北大学",
    buaa: "北京航空航天大学",
    pku: "北京大学",
    tsinghua: "清华大学",
    bupt: "北京邮电大学",
    huashunxinan: "华顺信安"
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
      nav.style.setProperty("--nav-pill-width", `${activeNavLink.offsetWidth}px`);
      nav.style.setProperty("--nav-pill-x", `${activeNavLink.offsetLeft}px`);
      nav.style.setProperty("--nav-pill-opacity", "1");
      window.requestAnimationFrame(() => {
        nav.classList.add("is-ready");
      });
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
    const switcher = document.querySelector(".lang-switch");
    const links = Array.from(document.querySelectorAll(".lang-switch a"));
    if (!switcher || !links.length) {
      return;
    }

    window.requestAnimationFrame(() => {
      switcher.classList.add("is-ready");
    });

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
    const brand = document.querySelector(".brand");
    if (!nav || !links.length) {
      return;
    }

    function animateNavTo(link, href) {
      links.forEach((item) => {
        if (item === link) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });

      nav.style.setProperty("--nav-pill-width", `${link.offsetWidth}px`);
      nav.style.setProperty("--nav-pill-x", `${link.offsetLeft}px`);

      window.setTimeout(() => {
        window.location.href = href;
      }, 220);
    }

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (link.getAttribute("href")?.startsWith("mailto:")) {
          return;
        }

        const currentPath = normalizePath(window.location.pathname);
        const targetPath = normalizePath(new URL(link.getAttribute("href"), window.location.href).pathname);
        if (currentPath === targetPath) {
          return;
        }

        event.preventDefault();
        animateNavTo(link, link.href);
      });
    });

    if (brand) {
      brand.addEventListener("click", (event) => {
        const currentPath = normalizePath(window.location.pathname);
        const targetPath = normalizePath(new URL(brand.getAttribute("href"), window.location.href).pathname);
        const homeLink = links.find((link) => normalizePath(new URL(link.getAttribute("href"), window.location.href).pathname) === targetPath);

        if (!homeLink || currentPath === targetPath) {
          return;
        }

        event.preventDefault();
        animateNavTo(homeLink, brand.href);
      });
    }
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

    const iconMap = {
      github: resolveAssetUrl("assets/img/github-fill.png"),
      arxiv: resolveAssetUrl("assets/img/arxiv-icon.png"),
      "hf-model": resolveAssetUrl("assets/img/huggingface.png"),
      "hf-dataset": resolveAssetUrl("assets/img/huggingface.png")
    };

    const textMap = {
      github: "GitHub",
      arxiv: "arXiv",
      "hf-model": "Model",
      "hf-dataset": "Dataset"
    };

    const icon = iconMap[className];
    const text = textMap[className] || label;

    return `
      <a class="resource-link ${className}" href="${href}" target="_blank" rel="noreferrer">
        ${icon ? `<img class="resource-icon" src="${icon}" alt="" aria-hidden="true" />` : ""}
        <span>${text}</span>
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

    const stage = container.querySelector(".slider-stage");
    const track = container.querySelector(".slider-track");
    const slideNodes = Array.from(container.querySelectorAll(".slider-card"));
    const dotNodes = Array.from(container.querySelectorAll("[data-slide-index]"));

    function syncSliderGeometry() {
      if (!stage || !track || !slideNodes.length) {
        return;
      }

      const slideWidth = stage.clientWidth;
      slideNodes.forEach((slide) => {
        slide.style.width = `${slideWidth}px`;
      });
      track.style.width = `${slideWidth * slideNodes.length}px`;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    function setActiveSlide(index) {
      currentIndex = index;
      if (stage && track) {
        track.style.transform = `translateX(-${currentIndex * stage.clientWidth}px)`;
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

    syncSliderGeometry();
    window.addEventListener("resize", syncSliderGeometry);

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
      .sort(comparePublications)
      .map(
        (item) => `
          <article class="publication-card">
            <div class="publication-meta">
              <div class="meta-badges">
                <span class="meta-badge">${item.venue}</span>
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
    const publicationCount = document.getElementById("publication-count");
    const partnerCountHome = document.getElementById("partner-count-home");
    const memberCount = document.getElementById("member-count");
    const partnerCount = document.getElementById("partner-count");

    if (publicationCount) {
      publicationCount.textContent = String(siteData.publications.length || 0);
    }

    if (partnerCountHome) {
      partnerCountHome.textContent = String(siteData.partners.length || 0);
    }

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

    const groups = [
      { key: "school", title: t("schools") },
      { key: "company", title: t("companies") }
    ];

    const renderPartnerCard = (partner) => `
      <a class="partner-card" href="${partner.url || "#"}" target="_blank" rel="noreferrer" data-partner="${partner.slug || ""}">
        ${
          partner.logo
            ? `<img class="partner-logo-image" src="${resolveAssetUrl(partner.logo)}" alt="${partner.name}" loading="lazy" decoding="async" />`
            : `<span class="partner-logo">${partner.logoText || "LOGO"}</span>`
        }
        <h3>${partner.name}</h3>
        <p>${partner.type || ""}</p>
      </a>
    `;

    container.innerHTML = groups
      .map((group) => {
        const partners = siteData.partners.filter((partner) => (partner.category || "school") === group.key);
        if (!partners.length) {
          return "";
        }

        return `
          <section class="partner-group">
            <h3 class="partner-group-title">${group.title}</h3>
            <div class="partner-grid">
              ${partners
                .map((partner) => {
                  const localizedPartner =
                    lang === "zh" && partnerNameZh[partner.slug]
                      ? { ...partner, name: partnerNameZh[partner.slug] }
                      : partner;
                  return renderPartnerCard(localizedPartner);
                })
                .join("")}
            </div>
          </section>
        `;
      })
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
