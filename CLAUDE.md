# Quote Image Maker

A single-page web app where the user picks a background image, generates a
random inspirational quote drawn onto it via HTML canvas, and downloads the
result as a high-quality PNG. Runs entirely in the browser — no server, no login.

## Tech constraints
- Plain HTML, CSS, and JavaScript only. No frameworks, no build tools, no npm.
- Exactly three files: index.html, style.css, script.js. (Plus an optional images/ folder.)
- Keep all CSS in style.css and all JS in script.js. No inline styles or scripts.
- Must run by opening index.html directly in a browser — no local server required.
- Deployed on GitHub Pages, so all paths must be relative (no leading "/").

## Code style
- 2-space indentation.
- Use const/let, never var.
- Small, single-purpose functions with clear names (getRandomQuote, drawQuoteImage,
  wrapText, loadImage, downloadImage, init).
- Add brief comments explaining the "why" — I'm a beginner and learning from this code.
- No console errors and no dead/commented-out code in committed files.

## Quality rules (always apply)
- Responsive: must work on mobile and desktop; canvas scales without distorting aspect ratio.
- Accessible: semantic HTML, descriptive labels on every control, visible keyboard focus, good contrast.
- Tap targets at least 44px tall.
- Export the canvas at 2x (window.devicePixelRatio) so downloads are sharp, not blurry.
- Handle errors gracefully (e.g. non-image upload) — show a friendly message, never crash.
- Never leave the screen blank: show a default gradient with a quote before any image is chosen.

## How I like to work
- Explain each change in plain language as you make it.
- When I ask for a new feature, build it as a small, self-contained step — don't refactor
  everything at once.
- Before adding any external API or library, ask me first. Version 1 must work fully offline.
- After a change, tell me how to test it in the browser.

## Added after v1
- Live quotes from an API. Source: DummyJSON (https://dummyjson.com/quotes/random),
  which is keyless and CORS-enabled (works from file:// and GitHub Pages).
  Controlled by the "Live quotes" checkbox (on by default). Always falls back to
  the bundled QUOTES on any network/timeout/error, so the app still works offline.

## Out of scope (don't add unless I ask)
- Meme / Impact-font mode
- Font / color pickers
- Draggable text
- Saving favorites
