const JINA_BASE = "https://r.jina.ai/";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "p2md-copy",
    title: chrome.i18n.getMessage("menuCopy"),
    contexts: ["page", "selection", "link"],
  });
  chrome.contextMenus.create({
    id: "p2md-download",
    title: chrome.i18n.getMessage("menuDownload"),
    contexts: ["page", "selection", "link"],
  });
});

async function getApiKey() {
  const { apiKey = "" } = await chrome.storage.sync.get("apiKey");
  return apiKey.trim();
}

async function toMarkdownUrl(targetUrl) {
  // r.jina.ai expects the full target URL appended.
  return JINA_BASE + targetUrl;
}

async function fetchMarkdown(targetUrl) {
  const apiKey = await getApiKey();
  const headers = { Accept: "text/markdown, text/plain;q=0.9" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const endpoint = await toMarkdownUrl(targetUrl);
  const res = await fetch(endpoint, { method: "GET", headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.text();
}

function safeFilename(url) {
  try {
    const u = new URL(url);
    const base = (u.hostname + u.pathname).replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
    return (base || "page") + ".md";
  } catch {
    return "page.md";
  }
}

async function handleAction(action, targetUrl, tabId) {
  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    await notify(tabId, chrome.i18n.getMessage("notifyUnsupportedUrl"));
    return;
  }
  try {
    const md = await fetchMarkdown(targetUrl);
    if (action === "copy") {
      // Copy via injecting a tiny script into the active tab (clipboard API needs user gesture in page context).
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (text) => {
          try {
            // try async clipboard first
            navigator.clipboard.writeText(text).catch(() => {});
            return true;
          } catch (e) {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            ta.remove();
            return ok;
          }
        },
        args: [md],
      });
      await notify(tabId, chrome.i18n.getMessage("notifyCopied", [String(md.length)]));
    } else if (action === "download") {
      // data: URL works across Chrome/Edge/Firefox service workers.
      const dataUrl = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
      await chrome.downloads.download({
        url: dataUrl,
        filename: safeFilename(targetUrl),
        saveAs: true,
      });
      await notify(tabId, chrome.i18n.getMessage("notifyDownloadStarted"));
    }
  } catch (err) {
    await notify(tabId, chrome.i18n.getMessage("notifyFailed", [String(err?.message || err)]));
  }
}

async function notify(tabId, message) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (m) => {
        const d = document.createElement("div");
        d.textContent = m;
        const _dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        d.style.cssText =
          "position:fixed;bottom:16px;right:16px;z-index:2147483647;padding:10px 14px;border-radius:8px;" +
          "background:" + (_dark ? "#374151" : "#1f2937") + ";color:#fff;" +
          "font:14px/1.4 system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3);max-width:360px;";
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 4000);
      },
      args: [message],
    });
  } catch {
    // tab may not allow scripting; ignore
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const targetUrl = info.linkUrl || info.pageUrl || tab?.url;
  if (info.menuItemId === "p2md-copy") handleAction("copy", targetUrl, tab.id);
  if (info.menuItemId === "p2md-download") handleAction("download", targetUrl, tab.id);
});

// Messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "convert") {
    handleAction(msg.action || "copy", msg.url, msg.tabId).then(() => sendResponse({ ok: true })).catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg?.type === "getApiKeyStatus") {
    getApiKey().then((k) => sendResponse({ hasKey: !!k }));
    return true;
  }
});
