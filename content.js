
(() => {
  if (window.__coket_injected__) return;
  window.__coket_injected__ = true;

  // Helpers de storage
  const getLinks = () =>
    new Promise((resolve) => chrome.storage.local.get(["coketLinks"], res => resolve(res.coketLinks || [])));
  const setLinks = (links) =>
    new Promise((resolve) => chrome.storage.local.set({ coketLinks: links }, resolve));

  // Cria FAB
  const fab = document.createElement("button");
  fab.id = "coket-fab";
  fab.setAttribute("type", "button");
  fab.title = "Coket — guardar e partilhar links";
  fab.innerHTML = "coket";  
  document.documentElement.appendChild(fab);

  // Painel
  const panel = document.createElement("div");
  panel.id = "coket-panel";
  panel.innerHTML = `
    
  <div id="coket-header">
      <div id="coket-title">Links guardados</div>
      <button id="coket-close" title="Fechar">&times;</button>
    </div>
    <div id="coket-body">
      <button id="coket-save">+ Guardar esta página</button>
      <div id="coket-list"></div>
    </div>
  `;
  document.documentElement.appendChild(panel);

  const listContainer = panel.querySelector("#coket-list");
  const closeBtn = panel.querySelector("#coket-close");
  const saveBtn = panel.querySelector("#coket-save");

  function setPanel(open) {
    panel.style.display = open ? "block" : "none";
  }

  function createItem(url, index, links) {
    const item = document.createElement("div");
    item.className = "coket-item";

    const urlEl = document.createElement("div");
    urlEl.className = "coket-url";
    urlEl.textContent = url;

    const actions = document.createElement("div");
    actions.className = "coket-actions";

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Partilhar";
    shareBtn.title = "Copiar link";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Eliminar";
    delBtn.title = "Remover da lista";

    shareBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(url);
        shareBtn.textContent = "Copiado!";
        setTimeout(() => (shareBtn.textContent = "Partilhar"), 1000);
      } catch (e) {
        alert("Não foi possível copiar. " + e.message);
      }
    });

    delBtn.addEventListener("click", async () => {
      const updated = [...links];
      updated.splice(index, 1);
      await setLinks(updated);
      renderList();
    });

    actions.appendChild(shareBtn);
    actions.appendChild(delBtn);

    item.appendChild(urlEl);
    item.appendChild(actions);
    return item;
  }

  async function renderList() {
    const links = await getLinks();
    listContainer.innerHTML = "";
    if (!links.length) {
      const empty = document.createElement("div");
      empty.id = "coket-empty";
      empty.textContent = "Nenhum link guardado ainda.";
      listContainer.appendChild(empty);
      return;
    }
    links.forEach((url, idx) => listContainer.appendChild(createItem(url, idx, links)));
  }

  // Eventos
  fab.addEventListener("click", async () => {
    const isOpen = panel.style.display === "block";
    setPanel(!isOpen);
    if (!isOpen) renderList();
  });

  closeBtn.addEventListener("click", () => setPanel(false));

  saveBtn.addEventListener("click", async () => {
    const url = location.href;
    const links = await getLinks();
    if (!links.includes(url)) {
      links.unshift(url);
      await setLinks(links);
      renderList();
      saveBtn.textContent = "Guardado!";
      setTimeout(() => (saveBtn.textContent = "+ Guardar esta página"), 1000);
    } else {
      saveBtn.textContent = "Já guardado";
      setTimeout(() => (saveBtn.textContent = "+ Guardar esta página"), 1000);
    }
  });

  // Garanta que o FAB não seja encoberto por elementos com pointer-events
  const styleFix = document.createElement("style");
  styleFix.textContent = `
    #coket-fab, #coket-panel { pointer-events: auto !important; }
  `;
  document.documentElement.appendChild(styleFix);
})();
