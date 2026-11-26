const ITEMS_KEY = "zeladoria-bairro-items";
const exampleItems = [
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

const pageType = document.body.dataset.page || "dashboard";
const searchInput = document.querySelector("#search-items");
const itemList = document.querySelector("#item-list");
const emptyState = document.querySelector("#empty-state");
const spaceCount = document.querySelector("#space-count");
const projectCount = document.querySelector("#project-count");

function getPublicItems() {
  try {
    const storedItems = localStorage.getItem(ITEMS_KEY);
    if (storedItems === null) {
      return [...exampleItems];
    }

    const parsedItems = JSON.parse(storedItems);
    if (
      !Array.isArray(parsedItems) ||
      !parsedItems.every((item) =>
        item &&
        typeof item.id === "string" &&
        (item.type === "space" || item.type === "project") &&
        typeof item.name === "string" &&
        typeof item.location === "string" &&
        typeof item.description === "string" &&
        typeof item.status === "string"
      )
    ) {
      throw new Error("Os cadastros salvos não estão em um formato válido.");
    }
    return parsedItems;
  } catch (error) {
    console.error("Não foi possível carregar os cadastros públicos:", error);
    emptyState.textContent = "Não foi possível carregar os cadastros neste navegador.";
    return [];
  }
}

function createPublicCard(item) {
  const card = document.createElement("article");
  card.className = "item-card";

  const typeLabel = document.createElement("span");
  typeLabel.className = "item-type";
  typeLabel.textContent = item.type === "space" ? "ESPAÇO PÚBLICO" : "PROJETO DO BAIRRO";

  const title = document.createElement("h3");
  title.textContent = item.name;

  const location = document.createElement("p");
  location.className = "item-location";
  location.textContent = `📍 ${item.location}`;

  const status = document.createElement("p");
  status.className = "public-status";
  status.textContent = `Situação: ${item.status}`;

  card.append(typeLabel, title, location);
  if (item.description) {
    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = item.description;
    card.append(description);
  }
  card.append(status);
  return card;
}

function renderPublicItems() {
  const allItems = getPublicItems();
  const visibleItems = allItems.filter((item) => {
    const matchesPage = pageType === "dashboard" || item.type === pageType;
    const searchableText = `${item.name} ${item.location} ${item.description}`.toLocaleLowerCase("pt-BR");
    return matchesPage && searchableText.includes(searchInput.value.trim().toLocaleLowerCase("pt-BR"));
  });

  itemList.replaceChildren(...visibleItems.map(createPublicCard));
  emptyState.hidden = visibleItems.length > 0;
  if (spaceCount) {
    spaceCount.textContent = String(allItems.filter((item) => item.type === "space").length);
  }
  if (projectCount) {
    projectCount.textContent = String(allItems.filter((item) => item.type === "project").length);
  }
}

searchInput.addEventListener("input", renderPublicItems);
renderPublicItems();
