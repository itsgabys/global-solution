const STORAGE_KEY = "zeladoria-bairro-items";

const statusOptions = {
  space: ["Em uso", "Em manutenção", "Interditado"],
  project: ["Planejado", "Em andamento", "Concluído"]
};

const starterItems = [
  {
    id: "sample-space",
    type: "space",
    name: "Praça das Flores",
    location: "Rua das Acácias, 25",
    description: "Praça com bancos, jardim e área de convivência.",
    status: "Em uso"
  },
  {
    id: "sample-project",
    type: "project",
    name: "Horta comunitária",
    location: "Terreno ao lado do centro comunitário",
    description: "Preparação de canteiros para plantio com os moradores.",
    status: "Em andamento"
  }
];

const form = document.querySelector("#item-form");
const typeInput = document.querySelector("#item-type");
const nameInput = document.querySelector("#item-name");
const locationInput = document.querySelector("#item-location");
const descriptionInput = document.querySelector("#item-description");
const formMessage = document.querySelector("#form-message");
const itemList = document.querySelector("#item-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-items");
const spaceCount = document.querySelector("#space-count");
const projectCount = document.querySelector("#project-count");
const filterButtons = document.querySelectorAll(".filter-button");
const pageType = document.body.dataset.page || "dashboard";

let activeFilter = pageType === "space" || pageType === "project" ? pageType : "all";
let items = loadItems();

function loadItems() {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    if (savedItems === null) {
      return [...starterItems];
    }

    const parsedItems = JSON.parse(savedItems);
    if (
      !Array.isArray(parsedItems) ||
      !parsedItems.every((item) =>
        item &&
        typeof item.id === "string" &&
        (item.type === "space" || item.type === "project") &&
        typeof item.name === "string" &&
        typeof item.location === "string" &&
        typeof item.description === "string" &&
        statusOptions[item.type].includes(item.status)
      )
    ) {
      throw new Error("Os cadastros salvos não estão em um formato válido.");
    }
    return parsedItems;
  } catch (error) {
    console.error("Não foi possível carregar os cadastros:", error);
    return [...starterItems];
  }
}

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar os cadastros:", error);
    formMessage.textContent = "Não foi possível salvar. Verifique o espaço disponível no navegador.";
    return false;
  }
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createItemCard(item) {
  const card = createElement("article", "item-card");
  const top = createElement("div", "item-card-top");
  const details = createElement("div");
  const typeLabel = createElement(
    "span",
    "item-type",
    item.type === "space" ? "ESPAÇO PÚBLICO" : "PROJETO DO BAIRRO"
  );
  const title = createElement("h3", "", item.name);
  const location = createElement("p", "item-location", `📍 ${item.location}`);

  details.append(typeLabel, title, location);
  top.append(details);
  card.append(top);

  if (item.description) {
    card.append(createElement("p", "item-description", item.description));
  }

  const controls = createElement("div", "item-controls");
  const statusField = createElement("div", "status-field");
  const statusId = `status-${item.id}`;
  const statusLabel = createElement("label", "", "Situação");
  statusLabel.htmlFor = statusId;

  const statusSelect = document.createElement("select");
  statusSelect.id = statusId;
  statusSelect.setAttribute("aria-label", `Situação de ${item.name}`);
  statusOptions[item.type].forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = status === item.status;
    statusSelect.append(option);
  });
  statusSelect.addEventListener("change", () => updateStatus(item.id, statusSelect.value));

  statusField.append(statusLabel, statusSelect);

  const deleteButton = createElement("button", "delete-button", "Excluir");
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Excluir ${item.name}`);
  deleteButton.addEventListener("click", () => deleteItem(item.id));

  controls.append(statusField, deleteButton);
  card.append(controls);
  return card;
}

function renderItems() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const visibleItems = items.filter((item) => {
    const matchesType = activeFilter === "all" || item.type === activeFilter;
    const searchableText = `${item.name} ${item.location} ${item.description}`.toLocaleLowerCase("pt-BR");
    return matchesType && searchableText.includes(searchTerm);
  });

  itemList.replaceChildren(...visibleItems.map(createItemCard));
  emptyState.hidden = visibleItems.length > 0;

  if (spaceCount) {
    spaceCount.textContent = String(items.filter((item) => item.type === "space").length);
  }
  if (projectCount) {
    projectCount.textContent = String(
      items.filter((item) => item.type === "project" && item.status === "Em andamento").length
    );
  }
}

function updateStatus(id, status) {
  const item = items.find((entry) => entry.id === id);
  if (!item || !statusOptions[item.type].includes(status)) {
    return;
  }

  const previousStatus = item.status;
  item.status = status;
  if (saveItems()) {
    renderItems();
  } else {
    item.status = previousStatus;
    renderItems();
  }
}

function deleteItem(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    return;
  }

  if (!window.confirm(`Deseja excluir "${item.name}"?`)) {
    return;
  }

  const previousItems = items;
  items = items.filter((entry) => entry.id !== id);
  if (saveItems()) {
    formMessage.textContent = `Cadastro "${item.name}" excluído.`;
    renderItems();
  } else {
    items = previousItems;
    renderItems();
  }
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const type = pageType === "space" || pageType === "project" ? pageType : typeInput.value;
    const newItem = {
      id: window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      name: nameInput.value.trim(),
      location: locationInput.value.trim(),
      description: descriptionInput.value.trim(),
      status: statusOptions[type][0]
    };

    items.unshift(newItem);
    if (saveItems()) {
      form.reset();
      formMessage.textContent = `Cadastro "${newItem.name}" adicionado.`;
      renderItems();
      nameInput.focus();
    } else {
      items.shift();
    }
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-selected", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });
    renderItems();
  });
});

searchInput.addEventListener("input", renderItems);

renderItems();
