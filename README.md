Please Note: This generator is 100% made by Claude Code

# Quote Image Maker

> Make quote images, roll through random memes, or caption your own — right in your browser.

A single-page web app with **three modes** for making and downloading shareable images.
It runs entirely in the browser: no server, no login, no build step, and it still works
offline.

**🌐 Live demo:** https://noobawahe.github.io/meme-quote-generator/

---

## Features

### ✍️ Quote mode
- Draws a random inspirational quote onto a background via HTML canvas.
- Pick one of three built-in gradients or **upload your own photo** as the background.
- **Live quotes** (toggle on) fetch fresh quotes from the internet, with an automatic
  fallback to ~50 bundled quotes so it always works offline.
- Download the result as a sharp **2× PNG**.

### 😄 Meme mode
- Pulls random memes from a pool of safe, meme-heavy subreddits.
- Shows the plain original image with no added text.
- A **"Recent"** filmstrip remembers your last 6 — click any to revisit.
- Filters out NSFW and non-image posts automatically.

### 🛠️ Maker mode
- Caption a **blank** meme template with your own words.
- ~290 templates pooled from two free sources, sorted into **Layout** categories by
  text-box count (2-box, 3-box, …) plus a gallery to pick a specific one.
- Per-caption **font, size, text colour, outline colour, and UPPERCASE** controls.
- **Drag** captions to reposition them (mouse + touch), or nudge with the **arrow keys**.
- Export the finished meme as a 2× PNG.

---

## Run it locally

No tools or install required — just open the file:

```
1. Download or clone this repo.
2. Double-click index.html (it opens straight in your browser).
```

Or clone from the command line:

```bash
git clone https://github.com/NoobaWaHe/meme-quote-generator.git
cd meme-quote-generator
# then open index.html in your browser
```

---

## How it's built

- **Plain HTML, CSS, and JavaScript only** — no frameworks, no build tools, no npm.
- Three files do everything:

  | File | Purpose |
  |------|---------|
  | `index.html` | Page structure and controls |
  | `style.css` | All styling (dark theme, per-mode accent colours) |
  | `script.js` | All logic (canvas drawing, fetching, dragging, export) |

- Designed to be **accessible** (semantic HTML, keyboard support, visible focus,
  ≥44px tap targets) and **responsive** down to mobile.
- Exports render at 2× device pixel ratio so downloads stay crisp.

### Online sources (all free, keyless, and optional)
| Mode | Source | Falls back to |
|------|--------|---------------|
| Quote | [DummyJSON](https://dummyjson.com/quotes/random) | bundled quotes (offline) |
| Meme | [meme-api.com](https://meme-api.com) | friendly error message |
| Maker | [memegen.link](https://api.memegen.link/templates/) + [Imgflip](https://api.imgflip.com/get_memes) | the other source if one is down |

Your own uploaded images never leave your device.

---

## License

Released under the [MIT License](LICENSE) © 2026 NoobaWaHe — free to use, modify, and share, with attribution.
