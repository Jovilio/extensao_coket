
function getLinks() {
  return new Promise((resolve) => chrome.storage.local.get(["coketLinks"], res => resolve(res.coketLinks || [])));
}
function setLinks(links) {
  return new Promise((resolve) => chrome.storage.local.set({ coketLinks: links }, resolve));
}

async function render() {
  const list = document.getElementById("list");
  const links = await getLinks();
  list.innerHTML = "";
  if (!links.length) {
    const empty = document.createElement("div");
    empty.id = "empty";
    empty.textContent = "Nenhum link guardado ainda.";
    list.appendChild(empty);
    return;
  }
  links.forEach((url, idx) => {
    const row = document.createElement("div");
    row.className = "item";
    const u = document.createElement("div");
    u.className = "url";
    u.textContent = url;
    const actions = document.createElement("div");
    actions.className = "actions";
    const share = document.createElement("button");
    share.textContent = "Partilhar";
    const del = document.createElement("button");
    del.textContent = "Eliminar";
    share.addEventListener("click", async () => {
      await navigator.clipboard.writeText(url);
      share.textContent = "Copiado!";
      setTimeout(() => share.textContent = "Partilhar", 1000);
    });
    del.addEventListener("click", async () => {
      const updated = [...links];
      updated.splice(idx, 1);
      await setLinks(updated);
      render();
    });
    actions.appendChild(share);
    actions.appendChild(del);
    row.appendChild(u);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

document.getElementById("save").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  const links = await getLinks();
  if (!links.includes(tab.url)) {
    links.unshift(tab.url);
    await setLinks(links);
    render();
  }
});

render();
