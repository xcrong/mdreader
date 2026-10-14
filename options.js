function t(key, subs) { return chrome.i18n.getMessage(key, subs); }

const els = {
  title: document.getElementById("title"),
  subtitle: document.getElementById("subtitle"),
  label: document.getElementById("labelKey"),
  input: document.getElementById("apiKey"),
  hint: document.getElementById("hint"),
  tier: document.getElementById("tierInfo"),
  status: document.getElementById("status"),
  save: document.getElementById("save"),
  test: document.getElementById("test"),
  clear: document.getElementById("clear"),
  toggle: document.getElementById("toggle"),
};

function setStatus(msg, kind) {
  els.status.textContent = msg;
  els.status.className = "status" + (kind ? " " + kind : "");
}

function updateTier() {
  const key = els.input.value.trim();
  els.tier.textContent = key ? t("optionsTierKey") : t("optionsTierFree");
}

async function load() {
  els.title.textContent = t("optionsTitle");
  els.subtitle.textContent = t("optionsSubtitle");
  els.label.textContent = t("optionsApiKeyLabel");
  els.input.placeholder = t("optionsPlaceholder");
  els.hint.textContent = t("optionsHint");
  els.save.textContent = t("optionsSave");
  els.test.textContent = t("optionsTest");
  els.clear.textContent = t("optionsClear");

  const { apiKey = "" } = await chrome.storage.sync.get("apiKey");
  els.input.value = apiKey;
  els.input.type = "password";
  updateTier();
}

els.toggle.addEventListener("click", () => {
  els.input.type = els.input.type === "password" ? "text" : "password";
});

els.input.addEventListener("input", updateTier);

els.save.addEventListener("click", async () => {
  await chrome.storage.sync.set({ apiKey: els.input.value.trim() });
  updateTier();
  setStatus(t("optionsSaved"), "ok");
  setTimeout(() => setStatus("", ""), 2000);
});

els.clear.addEventListener("click", async () => {
  els.input.value = "";
  await chrome.storage.sync.set({ apiKey: "" });
  updateTier();
  setStatus(t("optionsCleared"), "ok");
  setTimeout(() => setStatus("", ""), 2000);
});

els.test.addEventListener("click", async () => {
  const key = els.input.value.trim();
  setStatus(t("optionsTestWorking"), "warn");
  els.test.disabled = true;
  try {
    const headers = { Accept: "text/markdown, text/plain;q=0.9" };
    if (key) headers["Authorization"] = "Bearer " + key;
    const res = await fetch("https://r.jina.ai/https://example.com", { headers });
    const text = await res.text();
    if (!res.ok) throw new Error("HTTP " + res.status);
    setStatus(t("optionsTestOk", [String(res.status), String(text.length)]), "ok");
  } catch (err) {
    setStatus(t("notifyFailed", [String(err?.message || err)]), "err");
  } finally {
    els.test.disabled = false;
  }
});

load();
