const REQUESTS_KEY = "zeladoria-bairro-requests";
const requestStatuses = ["Recebida", "Em andamento", "Concluída"];
const requestForm = document.querySelector("#request-form");
const requestTitle = document.querySelector("#request-title");
const requestLocation = document.querySelector("#request-location");
const requestCategory = document.querySelector("#request-category");
const requestDescription = document.querySelector("#request-description");
const requestMessage = document.querySelector("#request-message");
const requestList = document.querySelector("#request-list");
const requestsEmptyState = document.querySelector("#requests-empty-state");
const requestSearch = document.querySelector("#search-requests");

let requests = loadRequests();

function loadRequests() {
  try {
    const savedRequests = localStorage.getItem(REQUESTS_KEY);
    if (savedRequests === null) {
      return [];
    }

    const parsedRequests = JSON.parse(savedRequests);
    if (
      !Array.isArray(parsedRequests) ||
      !parsedRequests.every((request) =>
        request &&
        typeof request.id === "string" &&
        typeof request.title === "string" &&
        typeof request.location === "string" &&
        typeof request.category === "string" &&
        typeof request.description === "string" &&
        requestStatuses.includes(request.status)
      )
    ) {
      throw new Error("As solicitações salvas não estão em um formato válido.");
    }
    return parsedRequests;
  } catch (error) {
    console.error("Não foi possível carregar as solicitações:", error);
    return [];
  }
}

function saveRequests() {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar as solicitações:", error);
    requestMessage.textContent = "Não foi possível salvar. Verifique o espaço disponível no navegador.";
    return false;
  }
}

function createRequestCard(request) {
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

  const status = document.createElement("p");
  status.className = "public-status";
  status.textContent = `Situação: ${request.status}`;
  card.append(status);
  return card;
}

function renderRequests() {
  const searchTerm = requestSearch.value.trim().toLocaleLowerCase("pt-BR");
  const visibleRequests = requests.filter((request) => {
    const searchableText = `${request.title} ${request.location} ${request.category} ${request.description}`
      .toLocaleLowerCase("pt-BR");
    return searchableText.includes(searchTerm);
  });
  requestList.replaceChildren(...visibleRequests.map(createRequestCard));
  requestsEmptyState.hidden = visibleRequests.length > 0;
  requestsEmptyState.textContent = requests.length === 0
    ? "Ainda não há solicitações. Use o formulário para registrar a primeira."
    : "Nenhuma solicitação encontrada. Tente buscar por outro termo.";
}

requestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const request = {
    id: window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: requestTitle.value.trim(),
    location: requestLocation.value.trim(),
    category: requestCategory.value,
    description: requestDescription.value.trim(),
    status: requestStatuses[0]
  };

  requests.unshift(request);
  if (saveRequests()) {
    requestForm.reset();
    requestMessage.textContent = "Solicitação registrada. A zeladoria poderá atualizar a situação.";
    renderRequests();
    requestTitle.focus();
  } else {
    requests.shift();
  }
});

requestSearch.addEventListener("input", renderRequests);
renderRequests();
