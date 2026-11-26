const ANNOUNCEMENTS_STORAGE_KEY = "zeladoria-bairro-announcements";
const announcementForm = document.querySelector("#announcement-form");
const announcementTitle = document.querySelector("#announcement-title");
const announcementBody = document.querySelector("#announcement-body");
const announcementMessage = document.querySelector("#announcement-message");
const adminAnnouncementsList = document.querySelector("#admin-announcements");
const adminAnnouncementsEmpty = document.querySelector("#admin-announcements-empty");

function loadAnnouncements() {
  try {
    const storedAnnouncements = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (storedAnnouncements === null) {
      return [];
    }
    const parsedAnnouncements = JSON.parse(storedAnnouncements);
    if (
      !Array.isArray(parsedAnnouncements) ||
      !parsedAnnouncements.every((announcement) =>
        announcement &&
        typeof announcement.id === "string" &&
        typeof announcement.title === "string" &&
        typeof announcement.body === "string" &&
        typeof announcement.publishedAt === "string"
      )
    ) {
      throw new Error("Os avisos salvos não estão em um formato válido.");
    }
    return parsedAnnouncements;
  } catch (error) {
    console.error("Não foi possível carregar os avisos:", error);
    announcementMessage.textContent = "Não foi possível carregar os avisos deste navegador.";
    return [];
  }
}

let announcements = loadAnnouncements();

function saveAnnouncements() {
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar os avisos:", error);
    announcementMessage.textContent = "Não foi possível salvar o aviso. Verifique o espaço disponível no navegador.";
    return false;
  }
}

function createAnnouncementCard(announcement) {
  const card = document.createElement("article");
  card.className = "announcement-card";

  const heading = document.createElement("div");
  heading.className = "announcement-card-heading";
  const title = document.createElement("h3");
  title.textContent = announcement.title;
  const publishedAt = document.createElement("time");
  publishedAt.dateTime = announcement.publishedAt;
  const date = new Date(announcement.publishedAt);
  publishedAt.textContent = Number.isNaN(date.getTime())
    ? "Data não disponível"
    : date.toLocaleDateString("pt-BR");
  heading.append(title, publishedAt);

  const body = document.createElement("p");
  body.textContent = announcement.body;

  const removeButton = document.createElement("button");
  removeButton.className = "delete-button";
  removeButton.type = "button";
  removeButton.textContent = "Excluir aviso";
  removeButton.setAttribute("aria-label", `Excluir aviso: ${announcement.title}`);
  removeButton.addEventListener("click", () => deleteAnnouncement(announcement.id));

  card.append(heading, body, removeButton);
  return card;
}

function renderAnnouncements() {
  adminAnnouncementsList.replaceChildren(...announcements.map(createAnnouncementCard));
  adminAnnouncementsEmpty.hidden = announcements.length > 0;
}

function deleteAnnouncement(id) {
  const announcement = announcements.find((entry) => entry.id === id);
  if (!announcement || !window.confirm(`Deseja excluir o aviso "${announcement.title}"?`)) {
    return;
  }

  const previousAnnouncements = announcements;
  announcements = announcements.filter((entry) => entry.id !== id);
  if (saveAnnouncements()) {
    announcementMessage.textContent = "Aviso excluído.";
    renderAnnouncements();
  } else {
    announcements = previousAnnouncements;
    renderAnnouncements();
  }
}

announcementForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const announcement = {
    id: window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: announcementTitle.value.trim(),
    body: announcementBody.value.trim(),
    publishedAt: new Date().toISOString()
  };

  announcements.unshift(announcement);
  if (saveAnnouncements()) {
    announcementForm.reset();
    announcementMessage.textContent = "Aviso publicado na página inicial.";
    renderAnnouncements();
    announcementTitle.focus();
  } else {
    announcements.shift();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === ANNOUNCEMENTS_STORAGE_KEY) {
    announcements = loadAnnouncements();
    renderAnnouncements();
  }
});

renderAnnouncements();
