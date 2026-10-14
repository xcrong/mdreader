function t(key) { return chrome.i18n.getMessage(key); }

document.querySelector("h2").textContent = t("optionsTitle");
const label = document.querySelector("label[for='apiKey']");
if (label) label.textContent = t("optionsApiKeyLabel");
const input = document.getElementById("apiKey");
input.placeholder = t("optionsPlaceholder");
document.getElementById("save").textContent = t("optionsSave");
const hint = document.querySelector(".hint");
if (hint) hint.textContent = t("optionsHint");

chrome.storage.sync.get("apiKey", ({ apiKey }) => {
  if (apiKey) input.value = apiKey;
});

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.sync.set({ apiKey: input.value.trim() });
  const status = document.getElementById("status");
  status.textContent = t("optionsSaved");
  setTimeout(() => (status.textContent = ""), 2000);
});
