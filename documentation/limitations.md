# Rendering Capabilities & Browser Boundaries

Truden uses **SnapDOM** as its capture engine, providing modern DOM rasterization that outperforms legacy tools (like `html2canvas`).

---

## Supported Media & Modern CSS Features

Unlike older capture libraries, Truden natively supports:

| Feature | Support | How SnapDOM Handles It |
| :--- | :--- | :--- |
| **`<video>` Elements** | ✅ Supported | Automatically snapshots the current playing video frame to an image (respecting `object-fit` and falling back to poster image if needed). |
| **`<canvas>` Elements** | ✅ Supported | Rasterizes 2D and 3D `<canvas>` elements directly into the snapshot, preserving intrinsic and CSS box dimensions. |
| **Same-Origin `<iframe>`** | ✅ Supported | Inlines same-origin iframe subtrees and automatically reads fonts from the iframe's own document. |
| **Modern CSS** | ✅ Supported | Flexbox, CSS Grid, `backdrop-filter`, `clip-path`, transforms, box-shadows, and web fonts (`@font-face`). |
| **Pixel-Exact Layout** | ✅ Supported | Built-in `{ reconcile: true }` prevents text re-wrapping or font-metric layout drift. |

---

## Browser Security Boundaries

Because Truden runs client-side in the browser, standard web security policies apply:

### 1. Cross-Origin Images & CORS
- Web browsers enforce CORS when exporting canvas pixels.
- External `<img>` tags or CSS background images loaded from third-party servers must include CORS headers (`Access-Control-Allow-Origin: *` or your domain).
- **If CORS headers are missing on third-party assets:** The browser blocks canvas export to protect user data from cross-site leakage.
- **Solution:** Ensure CDNs and image hosts serve assets with CORS headers, or proxy third-party images through your application backend.

### 2. Cross-Origin `<iframe>` Elements
- Web browsers strictly isolate cross-origin iframes (e.g. embedded YouTube players, Google Maps, or external payment iframes like Stripe Elements).
- JavaScript cannot inspect or read pixel data inside a cross-origin iframe due to the browser's **Same-Origin Policy**.
- **How Truden handles it:** Cross-origin iframes render cleanly as neat placeholders without throwing errors or halting the capture.

---

## Security Best Practices
- **API Keys:** Vision LLM API keys should **never** be included in client-side code. Always use **Mode B** (`truden/server`) so keys are kept securely on the backend.
- **Sensitive UI Content:** Ensure your backend AI prompt compliance policies handle scenarios where users select forms containing personal information.
