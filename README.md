# Page to Markdown (browser extension)

Fetches the current page as Markdown via [r.jina.ai](https://r.jina.ai) (Jina Reader).

## Feasibility notes
- The free tier needs no API key, ~20 req/min per IP.
- Requests are issued from the **background service worker** (Manifest V3) so the page's CORS does not apply; `host_permissions` covers `r.jina.ai`.
- Response can be large; service worker stays alive for the duration of `fetch`.
- Copying to clipboard is done by injecting a script into the active tab (service workers have no DOM/clipboard).
- Downloads use a Blob object URL revoked after 60s.

## Load (Chrome/Edge)
1. Open `chrome://extensions` (Edge: `edge://extensions`), enable Developer mode.
2. "Load unpacked" → select this folder.
3. (Optional) Options page → paste Jina API key.

## Load (Firefox)
1. Open `about:debugging#/runtime/this-firefox`.
2. "Load Temporary Add-on..." → select `manifest.json` in this folder.
3. (Optional) Add-ons → extension → Preferences → paste API key.

## Known issues / to decide
- Some sites behind Cloudflare may return 403 from Jina; retry with API key usually helps.
- Very long pages: data: URL for download may hit browser limits; could switch to chunked/streaming later.
- Transient user gesture may expire during fetch; clipboard falls back to `execCommand`.
