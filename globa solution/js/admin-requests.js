const ADMIN_REQUESTS_KEY = "zeladoria-bairro-requests";
const ADMIN_REQUEST_STATUSES = ["Recebida", "Em andamento", "Concluída"];
const adminRequestList = document.querySelector("#admin-request-list");
const adminRequestsEmpty = document.querySelector("#admin-requests-empty");
const adminRequestSearch = document.querySelector("#search-admin-requests");
const adminRequestMessage = document.querySelector("#admin-request-message");

function getAdminRequests() {
  try {
    const savedRequests = localStorage.getItem(ADMIN_REQUESTS_KEY);
    if (savedRequests === null) {
      return [];
    }
    const parsed = JSON.parse(savedRequests);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((request) =>
        request &&
        typeof request.id === "string" &&
        typeof request.title === "string" &&
        typeof request.location === "string" &&
        typeof request.category === "string" &&
        typeof request.description === "string" &&
        ADMIN_REQUEST_STATUSES.includes(request.status)
      )
    ) {
      throw new Error("As solicitações salvas não estão em um formato válido.");
    }
    return parsed;
  } catch (error) {
    console.error("Não foi possível carregar as solicitações:", error);
    adminRequestMessage.textContent = "Não foi possível carregar as solicitações deste navegador.";
    return [];
  }
}

function saveAdminRequests() {
  try {
    localStorage.setItem(ADMIN_REQUESTS_KEY, JSON.stringify(adminRequests));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar as solicitações:", error);
    adminRequestMessage.textContent = "Não foi possível salvar. Verifique o espaço disponível no navegador.";
    return false;
  }
}

function createAdminRequestCard(request) {
  const card = document.createElement("article");
  card.className = "item-card request-card";
  const category = document.createElement("span");
  category.className = "item-type";
  category.textContent = request.category.toLocaleUpperCase("pt-BR");
  const title = document.createElement("h3");
  title.textContent = request.title;
  const location = document.createElement("p");
  location.className = "item-location";
  location.textContent = `📍 ${request.location}`;
  card.append(category, title, location);

  if (request.description) {
    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = request.description;
    card.append(description);
  }

  const controls = document.createElement("div");
  controls.className = "item-controls";
  const statusField = document.createElement("div");
  statusField.className = "status-field";
  const selectId = `admin-request-status-${request.id}`;
  const label = document.createElement("label");
  label.htmlFor = selectId;
  label.textContent = "Situação";
  const select = document.createElement("select");
  select.id = selectId;
  select.setAttribute("aria-label", `Situação de ${request.title}`);
  ADMIN_REQUEST_STATUSES.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = status === request.status;
    select.append(option);
  });
  select.addEventListener("change", () => updateAdminRequest(request.id, select.value));
  statusField.append(label, select);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Excluir";
  deleteButton.setAttribute("aria-label", `Excluir solicitação: ${request.title}`);
  deleteButton.addEventListener("click", () => deleteAdminRequest(request.id));
  controls.append(statusField, deleteButton);
  card.append(controls);
  return card;
}

let adminRequests = getAdminRequests();

function renderAdminRequests() {
  const term = adminRequestSearch.value.trim().toLocaleLowerCase("pt-BR");
  const matches = adminRequests.filter((request) =>
    `${request.title} ${request.location} ${request.category} ${request.description}`
      .toLocaleLowerCase("pt-BR")
      .includes(term)
  );
  adminRequestList.replaceChildren(...matches.map(createAdminRequestCard));
  adminRequestsEmpty.hidden = matches.length > 0;
  adminRequestsEmpty.textContent = adminRequests.length === 0
    ? "Ainda não há solicitações da comunidade."
    : "Nenhuma solicitação encontrada. Tente buscar por outro termo.";
}

function updateAdminRequest(id, status) {
  const request = adminRequests.find((entry) => entry.id === id);
  if (!request || !ADMIN_REQUEST_STATUSES.includes(status)) {
    return;
  }
  const oldStatus = request.status;
  request.status = status;
  if (saveAdminRequests()) {
    renderAdminRequests();
  } else {
    request.status = oldStatus;
    renderAdminRequests();
  }
}

function deleteAdminRequest(id) {
  const request = adminRequests.find((entry) => entry.id === id);
  if (!request || !window.confirm(`Deseja excluir a solicitação "${request.title}"?`)) {
    return;
  }
  const previous = adminRequests;
  adminRequests = adminRequests.filter((entry) => entry.id !== id);
  if (saveAdminRequests()) {
    adminRequestMessage.textContent = "Solicitação excluída.";
    renderAdminRequests();
  } else {
    adminRequests = previous;
    renderAdminRequests();
  }
}

adminRequestSearch.addEventListener("input", renderAdminRequests);
window.addEventListener("storage", (event) => {
  if (event.key === ADMIN_REQUESTS_KEY) {
    adminRequests = getAdminRequests();
    renderAdminRequests();
  }
});
renderAdminRequests();
