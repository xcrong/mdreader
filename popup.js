function t(key) { return chrome.i18n.getMessage(key); }

document.getElementById("options").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Apply localized strings
document.querySelector("h3").textContent = t("popupTitle");
document.getElementById("copy").textContent = t("popupCopy");
document.getElementById("download").textContent = t("popupDownload");

async function run(action) {
  const status = document.getElementById("status");
  status.textContent = t("popupWorking");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) { status.textContent = t("popupNoTab"); return; }
  chrome.runtime.sendMessage({ type: "convert", action, url: tab.url, tabId: tab.id }, (resp) => {
    if (chrome.runtime.lastError) { status.textContent = chrome.runtime.lastError.message; return; }
    status.textContent = resp?.ok ? t("popupDone") : (resp?.error || t("popupFailed"));
  });
}

document.getElementById("copy").addEventListener("click", () => run("copy"));
document.getElementById("download").addEventListener("click", () => run("download"));
