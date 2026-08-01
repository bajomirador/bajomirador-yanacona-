const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");
const toast = document.getElementById("toast");

menuButton?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

let siteEmail = window.SITE_CONFIG?.email || "comunidad@ejemplo.org";
let sitePhone = window.SITE_CONFIG?.whatsapp || "Agregar número oficial";

function setText(id, value) {
  const element = document.getElementById(id);
  if (element && typeof value === "string" && value.trim()) {
    element.textContent = value;
  }
}

function renderStats(stats = []) {
  const container = document.getElementById("stat-grid");
  if (!container || !Array.isArray(stats) || !stats.length) return;
  container.innerHTML = stats
    .map((item) => `<div><strong>${escapeHtml(item.value || "")}</strong><span>${escapeHtml(item.label || "")}</span></div>`)
    .join("");
}

function renderList(id, items = []) {
  const container = document.getElementById(id);
  if (!container || !Array.isArray(items) || !items.length) return;
  container.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderGallery(items = []) {
  const container = document.getElementById("photo-grid");
  if (!container || !Array.isArray(items) || !items.length) return;
  container.innerHTML = items
    .map((item) => `
      <figure class="photo-card">
        <img src="${escapeAttribute(item.image || "")}" alt="${escapeAttribute(item.alt || item.title || "Fotografía de la comunidad")}" loading="lazy" />
        <figcaption>
          <strong>${escapeHtml(item.title || "")}</strong>
          <span>${escapeHtml(item.description || "")}</span>
        </figcaption>
      </figure>`)
    .join("");
}

function renderProjects(items = []) {
  const container = document.getElementById("project-grid");
  if (!container || !Array.isArray(items) || !items.length) return;
  container.innerHTML = items
    .map((item, index) => `
      <article class="project-card ${item.featured || index === 0 ? "featured" : ""}">
        <span class="tag">${escapeHtml(item.tag || "")}</span>
        <h3>${escapeHtml(item.title || "")}</h3>
        <p>${escapeHtml(item.description || "")}</p>
        ${item.link_text && item.link_url ? `<a href="${escapeAttribute(item.link_url)}">${escapeHtml(item.link_text)} →</a>` : ""}
      </article>`)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

async function loadSiteContent() {
  try {
    const response = await fetch("/content/site.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar el contenido");
    const data = await response.json();

    setText("hero-eyebrow", data.hero?.eyebrow);
    setText("hero-title", data.hero?.title);
    setText("hero-description", data.hero?.description);
    renderStats(data.hero?.stats);

    setText("about-title", data.about?.title);
    setText("about-p1", data.about?.paragraph_1);
    setText("about-p2", data.about?.paragraph_2);

    setText("territory-title", data.territory?.title);
    setText("territory-description", data.territory?.description);
    renderList("territory-list", data.territory?.priorities);

    setText("gallery-title", data.gallery?.title);
    setText("gallery-intro", data.gallery?.intro);
    renderGallery(data.gallery?.items);

    setText("projects-title", data.projects?.title);
    setText("projects-intro", data.projects?.intro);
    renderProjects(data.projects?.items);

    setText("alliances-title", data.alliances?.title);
    setText("alliances-description", data.alliances?.description);

    setText("contact-title", data.contact?.title);
    setText("contact-description", data.contact?.description);
    setText("public-location", data.contact?.location);

    siteEmail = data.contact?.email || siteEmail;
    sitePhone = data.contact?.whatsapp || sitePhone;
    setText("public-email", siteEmail);
    setText("public-phone", sitePhone);
  } catch (error) {
    console.warn("Se usará el contenido incluido en la página.", error);
    setText("public-email", siteEmail);
    setText("public-phone", sitePhone);
  }
}

document.querySelectorAll('[data-placeholder="true"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showToast("Este documento se agregará cuando esté disponible.");
  });
});

document.getElementById("contactForm")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const organization = document.getElementById("organization").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  const subject = encodeURIComponent("Contacto desde el sitio web de Bajo Mirador");
  const body = encodeURIComponent(
    `Nombre: ${name}\nOrganización: ${organization || "No indicada"}\nCorreo: ${email}\n\nMensaje:\n${message}`
  );

  window.location.href = `mailto:${siteEmail}?subject=${subject}&body=${body}`;
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3000);
}

loadSiteContent();
