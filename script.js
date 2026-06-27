'use strict';

/* ============================================================
   Quote Image Maker — script
   Picks a random quote and draws it onto a background (a bundled
   gradient or an uploaded photo) on a <canvas>, then lets you save
   the result as a high-resolution PNG. Runs fully in the browser.

   Draw order, every redraw: background -> dark overlay -> quote -> author.
   ============================================================ */

/* 50 quotes, each a simple object with the text and who said it — weighted
   toward classic/ancient thinkers. Kept right here in the file so the app
   works fully offline. */
const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Do not watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'Everything you can imagine is real.', author: 'Pablo Picasso' },
  { text: 'What we think, we become.', author: 'Buddha' },
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Whether you think you can or you cannot, you are right.', author: 'Henry Ford' },
  { text: 'Dream big and dare to fail.', author: 'Norman Vaughan' },
  { text: 'The journey of a thousand miles begins with one step.', author: 'Lao Tzu' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'To find yourself, think for yourself.', author: 'Socrates' },
  { text: 'The beginning is the most important part of the work.', author: 'Plato' },
  { text: 'Wise men speak because they have something to say; fools because they have to say something.', author: 'Plato' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'Patience is bitter, but its fruit is sweet.', author: 'Aristotle' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { text: 'Wherever you go, go with all your heart.', author: 'Confucius' },
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu' },
  { text: 'When I let go of what I am, I become what I might be.', author: 'Lao Tzu' },
  { text: 'Knowing others is intelligence; knowing yourself is true wisdom.', author: 'Lao Tzu' },
  { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'As long as you live, keep learning how to live.', author: 'Seneca' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'It is not what happens to you, but how you react to it that matters.', author: 'Epictetus' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'No man ever steps in the same river twice.', author: 'Heraclitus' },
  { text: 'Change is the only constant.', author: 'Heraclitus' },
  { text: 'In the midst of chaos, there is also opportunity.', author: 'Sun Tzu' },
  { text: 'The life given us by nature is short, but the memory of a life well spent is eternal.', author: 'Cicero' },
  { text: 'A room without books is like a body without a soul.', author: 'Cicero' },
  { text: 'Not what we have, but what we enjoy, constitutes our abundance.', author: 'Epicurus' },
  { text: 'Do not say a little in many words, but a great deal in a few.', author: 'Pythagoras' },
  { text: 'The wound is the place where the light enters you.', author: 'Rumi' },
  { text: 'What you seek is seeking you.', author: 'Rumi' },
  { text: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.', author: 'Rumi' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
  { text: 'Fortune favors the bold.', author: 'Virgil' },
  { text: 'Be patient and tough; someday this pain will be useful to you.', author: 'Ovid' },
  { text: 'Wisdom outweighs any wealth.', author: 'Sophocles' },
];

/* Three bundled gradients used as the default background before any photo is
   chosen. Each is three color stops (start, middle, end). They are dark enough
   that the light quote text stays readable. */
const GRADIENTS = [
  ['#3a1c71', '#5f2c82', '#2c5364'], // aurora (violet -> teal)
  ['#0f2027', '#203a43', '#2c5364'], // deep sea (teal greys)
  ['#2c1810', '#643d2b', '#8e3b2f'], // ember (warm browns)
];

/* App state: what is currently on the canvas. Keeping these here lets the quote
   and the background change independently. */
let currentQuote = null;
let currentImage = null;          // the uploaded photo, or null for a gradient
let currentGradientIndex = 0;     // which gradient is showing in the default state
let swatchButtons = [];           // the gradient swatch buttons, filled in by init()
let liveMode = true;              // when on, "New quote" fetches from the online API
let isFetching = false;           // guards against overlapping fetches
let newQuoteButton = null;        // cached so we can disable it while a fetch runs

let currentMode = 'quote';        // 'quote' or 'meme'
let memeHistory = [];             // up to MEME_HISTORY_MAX recent memes (oldest..newest)
let currentMemeIndex = -1;        // which history item is currently on screen
let isFetchingMeme = false;       // guards against overlapping meme fetches
let memeButton = null;            // cached so we can disable it while fetching
let memePool = [];                // shuffled, not-yet-shown memes ready to serve
let memePoolKey = null;           // which source the current pool was built for
const seenMemeLinks = new Set();  // memes already shown this session (avoids repeats)

let makerTemplates = [];          // cached blank templates from Imgflip
let isFetchingMaker = false;      // guards overlapping template loads
let currentTemplate = null;       // the template currently on the maker canvas
let currentTemplateImage = null;  // its loaded <img> (crossOrigin=anonymous)
let makerLogicalW = 0;            // logical maker-canvas size (matches template aspect)
let makerLogicalH = 0;
let makerButton = null;           // cached "New template" button
let captions = [];                // the text boxes drawn on the current template
let captionSeq = 0;               // ever-increasing id source for captions
let selectedCaptionId = null;     // which caption the style controls + dragging act on
let draggingCaption = null;       // the caption currently being dragged, or null
let dragOffsetX = 0;              // grab point offset from the caption center (logical px)
let dragOffsetY = 0;

/* Grab the canvas and its 2D context once. */
const canvas = document.getElementById('quote-canvas');
const ctx = canvas.getContext('2d');

/* The maker mode has its own canvas (the meme you're captioning). */
const makerCanvas = document.getElementById('maker-canvas');
const makerCtx = makerCanvas.getContext('2d');

/* Logical drawing size (a square). All the draw functions work in these
   coordinates; drawQuoteImage scales the real canvas up for a sharp export. */
const CANVAS_SIZE = 1080;

/* Online source for "live" quotes (keyless, CORS-enabled). It returns a
   { quote, author } object. If it can't be reached we fall back to QUOTES,
   so the app keeps working fully offline. */
const QUOTE_API_URL = 'https://dummyjson.com/quotes/random';

/* Meme mode pulls random memes from a free, keyless, CORS-enabled API. We always
   request from one of a few safe, meme-heavy subreddits and still skip anything
   flagged NSFW. */
const MEME_API_URL = 'https://meme-api.com/gimme';
/* A spread of safe, meme-heavy subreddits. "Surprise me" pools batches from all
   of them (a couple hundred memes) so you can pull for a long time before any
   repeat; choosing a category pulls from just its subreddit. */
const SAFE_SUBREDDITS = [
  'memes', 'wholesomememes', 'ProgrammerHumor', 'HistoryMemes', 'me_irl',
  'meirl', 'AdviceAnimals', 'comedyheaven', 'terriblefacebookmemes',
];
const MEME_HISTORY_MAX = 6;
const MEME_BATCH_SIZE = 50; // memes requested per subreddit (API returns up to this)

/* Meme Maker mode pulls BLANK meme templates (no caption baked in) so the user
   can add their own words. Imgflip's get_memes is free, keyless, and CORS-clean
   for both the JSON and the image bytes — so a template can be drawn on a canvas
   and exported as a PNG without "tainting" it. Each template tells us its
   box_count: how many caption slots it's designed for. */
const IMGFLIP_API_URL = 'https://api.imgflip.com/get_memes';
const MAKER_MAX_SIZE = 1080; // cap a template's longest side (sharp export, sane size)

/* Pick a random quote. If we happen to land on the one already showing, step to
   the next one so the button always visibly changes something. */
function getRandomQuote() {
  const index = Math.floor(Math.random() * QUOTES.length);
  const quote = QUOTES[index];
  if (currentQuote && quote.text === currentQuote.text) {
    return QUOTES[(index + 1) % QUOTES.length];
  }
  return quote;
}

/* Loading an image is asynchronous, so wrap the old onload/onerror callbacks in
   a Promise. That lets us use async/await and know exactly when the picture is
   ready to draw. */
function loadImage(src, crossOrigin) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // For images from another site (meme templates), request them cross-origin so
    // the canvas stays "clean" and can still be exported as a PNG. Must be set
    // before src. Harmless for local object URLs, which pass undefined here.
    if (crossOrigin) {
      image.crossOrigin = crossOrigin;
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image failed to load'));
    image.src = src;
  });
}

/* Fetch a random quote from the online API and return it in our { text, author }
   shape. Throws on any network/timeout/bad-response problem so the caller can
   fall back to a bundled quote. The AbortController gives up after 8 seconds so
   a stuck request doesn't hang the button forever. */
async function fetchQuote() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(QUOTE_API_URL, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (!data || !data.quote || !data.author) {
      throw new Error('Unexpected response shape');
    }
    return { text: data.quote, author: data.author };
  } finally {
    clearTimeout(timer);
  }
}

/* Break a string into lines that each fit inside maxWidth, so long quotes wrap
   neatly instead of running off the edges. The font must already be set on the
   context, because measureText depends on it. */
function wrapText(context, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

/* Draw an image so it COVERS the whole canvas (fills it, cropping the overflow)
   while keeping the image's aspect ratio — so the photo is never stretched. */
function drawImageCover(context, image, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  // Center the scaled image so the crop is even on both sides.
  const dx = (width - drawWidth) / 2;
  const dy = (height - drawHeight) / 2;
  context.drawImage(image, dx, dy, drawWidth, drawHeight);
}

/* Step 1 of the draw order: the background — the uploaded photo if there is one,
   otherwise the current gradient. */
function drawBackground(context, width, height) {
  if (currentImage) {
    drawImageCover(context, currentImage, width, height);
    return;
  }
  const stops = GRADIENTS[currentGradientIndex];
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, stops[0]);
  gradient.addColorStop(0.5, stops[1]);
  gradient.addColorStop(1, stops[2]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

/* Step 2 of the draw order: darken the background so light text stays readable.
   A flat layer gives overall contrast, and a soft vignette (darker at the edges)
   frames the quote and helps it stand out over busy photos. */
function drawOverlay(context, width, height) {
  context.fillStyle = 'rgba(0, 0, 0, 0.35)';
  context.fillRect(0, 0, width, height);

  const vignette = context.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

/* Steps 3 + 4 of the draw order: the quote (elegant serif), a short accent rule,
   and the author (small, uppercase, letter-spaced sans) — centered as one block. */
function drawQuoteText(context, quote, width, height) {
  const maxWidth = width * 0.8;          // keep text off the side edges
  const maxBlockHeight = height * 0.8;   // and off the top and bottom
  const authorSize = Math.round(width / 36);
  const dividerHeight = Math.max(2, Math.round(width / 380));
  const dividerWidth = width * 0.06;
  const serif = '"Hoefler Text", "Palatino Linotype", Palatino, Georgia, serif';

  // Choose the biggest quote size at which the whole block (quote lines, divider,
  // and author) still fits the canvas. Short quotes stay big and bold; long ones
  // shrink to fit instead of overflowing the edges.
  let quoteSize = Math.round(width / 15);
  const minQuoteSize = Math.round(width / 26);
  let lines = [];
  while (true) {
    context.font = '500 ' + quoteSize + 'px ' + serif;
    lines = wrapText(context, '“' + quote.text + '”', maxWidth);
    const blockHeight =
      lines.length * (quoteSize * 1.32) +
      quoteSize * 0.7 + dividerHeight + quoteSize * 0.55 + authorSize;
    if (blockHeight <= maxBlockHeight || quoteSize <= minQuoteSize) {
      break;
    }
    quoteSize -= 2;
  }

  // Final spacing, now that the quote size is settled.
  const lineHeight = quoteSize * 1.32;
  const dividerGap = quoteSize * 0.7;
  const authorGap = quoteSize * 0.55;
  const totalHeight =
    lines.length * lineHeight + dividerGap + dividerHeight + authorGap + authorSize;
  let cursorY = (height - totalHeight) / 2;

  context.textAlign = 'center';
  context.textBaseline = 'top';

  // --- Quote lines (with a soft shadow so they read on any background) ---
  context.font = '500 ' + quoteSize + 'px ' + serif;
  context.fillStyle = '#f7f5f0';
  context.shadowColor = 'rgba(0, 0, 0, 0.45)';
  context.shadowBlur = quoteSize * 0.32;
  context.shadowOffsetY = 2;
  for (const line of lines) {
    context.fillText(line, width / 2, cursorY);
    cursorY += lineHeight;
  }

  // Turn the shadow off so it can't bleed into the crisp shapes below.
  context.shadowColor = 'transparent';
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  // --- Accent divider rule ---
  cursorY += dividerGap;
  context.fillStyle = '#8aa0ff';
  context.fillRect(width / 2 - dividerWidth / 2, cursorY, dividerWidth, dividerHeight);
  cursorY += dividerHeight + authorGap;

  // --- Author (uppercase, letter-spaced; spacing is ignored gracefully on the
  //     few browsers that don't support canvas letterSpacing) ---
  context.fillStyle = 'rgba(255, 255, 255, 0.82)';
  context.font = '600 ' + authorSize + 'px system-ui, -apple-system, "Segoe UI", sans-serif';
  context.letterSpacing = Math.round(authorSize * 0.18) + 'px';
  context.fillText(quote.author.toUpperCase(), width / 2, cursorY);
  context.letterSpacing = '0px';
}

/* Size the canvas once for a high-resolution export. We render at 2x (or the
   screen's pixel ratio, whichever is larger) so the downloaded PNG is crisp. We
   draw in logical CANVAS_SIZE units and let this transform scale everything up
   into the bigger backing store; the CSS shrinks the canvas to fit the layout,
   so the preview matches the download. The size never changes afterwards, so we
   only do this once — every redraw simply paints over the top. */
function setupCanvas() {
  const scale = Math.max(2, window.devicePixelRatio || 1);
  canvas.width = CANVAS_SIZE * scale;
  canvas.height = CANVAS_SIZE * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

/* Repaint the whole scene in order: background -> overlay -> quote + author.
   The background always fills the canvas, so there's no need to clear first. */
function drawQuoteImage() {
  drawBackground(ctx, CANVAS_SIZE, CANVAS_SIZE);
  drawOverlay(ctx, CANVAS_SIZE, CANVAS_SIZE);
  drawQuoteText(ctx, currentQuote, CANVAS_SIZE, CANVAS_SIZE);

  // Keep the canvas's accessible name in sync with the quote on screen, so a
  // screen reader can read the words that are otherwise just pixels.
  canvas.setAttribute(
    'aria-label',
    'Quote: “' + currentQuote.text + '” by ' + currentQuote.author
  );
}

/* Show a friendly message (or error) in the status line below the controls. */
function showMessage(text, isError) {
  const status = document.getElementById('status');
  status.textContent = text;
  status.classList.toggle('status--error', Boolean(isError));
}

/* Reflect the current background choice in the swatch buttons (aria-pressed),
   so keyboard and screen-reader users know which gradient is active. A swatch is
   only "pressed" when its gradient is actually showing (no photo is active). */
function updateSwatchSelection() {
  for (const swatch of swatchButtons) {
    const index = Number(swatch.dataset.gradient);
    const selected = !currentImage && index === currentGradientIndex;
    swatch.setAttribute('aria-pressed', selected ? 'true' : 'false');
  }
}

/* Switch the background to one of the bundled gradients. This also clears any
   uploaded photo, giving the user a simple way back to a gradient. */
function selectGradient(index) {
  currentImage = null;
  currentGradientIndex = index;
  updateSwatchSelection();
  drawQuoteImage();
  showMessage('', false);
}

/* Save the current canvas as a PNG. toDataURL turns the canvas pixels into an
   image the browser downloads — no server needed, because everything was drawn
   locally. The file is high-resolution because the canvas is rendered at 2x. */
function downloadImage() {
  try {
    const link = document.createElement('a');
    link.download = 'quote.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showMessage('Saved as quote.png.', false);
  } catch (error) {
    showMessage('Sorry, the image could not be saved. Please try again.', true);
  }
}

/* Show a fresh quote on the CURRENT background (photo or gradient stays put).
   In live mode we fetch one from the API; if that fails for any reason we fall
   back to a bundled quote, so the app always keeps working. */
async function showNewQuote() {
  if (!liveMode) {
    currentQuote = getRandomQuote(); // instant, offline
    drawQuoteImage();
    return;
  }

  if (isFetching) {
    return; // a request is already in flight; ignore extra presses
  }
  isFetching = true;
  newQuoteButton.disabled = true;
  showMessage('Finding a fresh quote…', false);
  try {
    currentQuote = await fetchQuote();
    showMessage('', false);
  } catch (error) {
    currentQuote = getRandomQuote();
    showMessage('Could not reach the quote service — showing a built-in quote.', false);
  } finally {
    isFetching = false;
    newQuoteButton.disabled = false;
    drawQuoteImage();
  }
}

/* Flip between online (live) quotes and the instant bundled ones. */
function handleLiveToggle(event) {
  liveMode = event.target.checked;
}

/* Spacebar shows a new quote — but not while the user is typing in a field or
   focused on a control that already responds to Space (a button or the file
   input), so we never hijack typing or fire the action twice. */
function handleKeydown(event) {
  if (event.key !== ' ' && event.code !== 'Space') {
    return;
  }
  const active = document.activeElement;
  const tag = active ? active.tagName : '';
  const usesSpaceItself =
    tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON';
  // Also leave the maker canvas alone — it's focusable for arrow-key nudging, and
  // Space there shouldn't roll a new template while you're positioning captions.
  if (usesSpaceItself || (active && active.isContentEditable) ||
      (active && active.id === 'maker-canvas')) {
    return;
  }
  event.preventDefault(); // stop the page from scrolling down
  if (currentMode === 'meme') {
    showNewMeme();
  } else if (currentMode === 'maker') {
    showNewTemplate();
  } else {
    showNewQuote();
  }
}

/* Handle a chosen file: reject non-images politely, otherwise load it, set it as
   the background, and redraw. */
async function handleImageChange(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  if (!file) {
    return;
  }

  // Guard against non-image files (the accept attribute is only a hint).
  if (!file.type.startsWith('image/')) {
    showMessage('That file is not an image. Please choose a JPG, PNG, GIF, or WebP.', true);
    input.value = '';
    return;
  }

  showMessage('Loading your image…', false);

  // createObjectURL gives the file a temporary in-memory address to load from;
  // we revoke it afterwards to free that memory.
  const url = URL.createObjectURL(file);
  try {
    currentImage = await loadImage(url);
    updateSwatchSelection(); // a photo is active now, so no swatch is "pressed"
    drawQuoteImage();
    showMessage('Background updated.', false);
  } catch (error) {
    showMessage('Sorry, that image could not be loaded. Please try another file.', true);
  } finally {
    URL.revokeObjectURL(url);
    // Clear the input so picking the same file again still fires a change event.
    input.value = '';
  }
}

/* ============================================================
   Meme mode — pull random memes from a free API and keep a short
   history of the ones you've seen. No text is added to the image.
   ============================================================ */

/* The category currently selected ('surprise' or a specific subreddit). */
function selectedMemeSource() {
  return document.getElementById('meme-source-select').value;
}

/* Accept only URLs that point straight at an image, so we skip Reddit videos and
   galleries that wouldn't show in an <img>. */
function isLikelyImageUrl(url) {
  return /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(url);
}

/* A smaller preview image for the history thumbnail (falls back to the full one). */
function pickThumb(data) {
  if (Array.isArray(data.preview) && data.preview.length) {
    return data.preview[Math.min(2, data.preview.length - 1)];
  }
  return data.url;
}

/* Turn one API record into our meme shape, or null if it isn't a safe, directly
   viewable image. */
function mapMeme(data) {
  if (!data || !data.url || data.nsfw || data.spoiler || !isLikelyImageUrl(data.url)) {
    return null;
  }
  return {
    url: data.url,
    title: data.title || 'Meme',
    postLink: data.postLink || '',
    thumb: pickThumb(data),
  };
}

/* Fetch a batch of memes from one subreddit (the API returns up to ~50). Returns
   a possibly-empty array of safe, image-only memes. */
async function fetchMemeBatch(subreddit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(MEME_API_URL + '/' + subreddit + '/' + MEME_BATCH_SIZE, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    const list = Array.isArray(data.memes) ? data.memes : data.url ? [data] : [];
    return list.map(mapMeme).filter(Boolean);
  } finally {
    clearTimeout(timer);
  }
}

/* Shuffle an array in place (Fisher–Yates) so the pool serves in random order. */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* Build a pool for a source: "surprise" combines batches from every safe
   subreddit (a couple hundred memes); a category uses just its subreddit.
   Duplicates and already-seen memes are dropped so you keep getting new ones. */
async function buildMemePool(sourceKey) {
  const subreddits = sourceKey === 'surprise' ? SAFE_SUBREDDITS : [sourceKey];
  // Fetch every subreddit at once; ignore any individual failures.
  const batches = await Promise.all(
    subreddits.map((sub) => fetchMemeBatch(sub).catch(() => []))
  );
  const byUrl = new Map();
  for (const batch of batches) {
    for (const meme of batch) {
      if (!byUrl.has(meme.url) && !seenMemeLinks.has(meme.postLink)) {
        byUrl.set(meme.url, meme);
      }
    }
  }
  return shuffle(Array.from(byUrl.values()));
}

/* Get the next unseen meme, (re)building the pool when the source changes or the
   pool runs dry. If every fresh meme has already been seen, forget the seen list
   so we can keep serving instead of failing. */
async function nextMemeFromPool(sourceKey) {
  if (sourceKey !== memePoolKey || memePool.length === 0) {
    memePool = await buildMemePool(sourceKey);
    memePoolKey = sourceKey;
    if (memePool.length === 0 && seenMemeLinks.size > 0) {
      seenMemeLinks.clear();
      memePool = await buildMemePool(sourceKey);
    }
  }
  if (memePool.length === 0) {
    throw new Error('No memes available');
  }
  const meme = memePool.pop();
  if (meme.postLink) {
    seenMemeLinks.add(meme.postLink);
  }
  return meme;
}

/* Show a friendly message (or error) in the meme status line. */
function showMemeMessage(text, isError) {
  const status = document.getElementById('meme-status');
  status.textContent = text;
  status.classList.toggle('status--error', Boolean(isError));
}

/* Show a meme in the stage. Per the brief, nothing is drawn on or around it —
   just the plain image. The alt text (for screen readers) carries the title. */
function renderMeme(meme) {
  const stage = document.querySelector('.meme-stage');
  const image = document.getElementById('meme-image');
  stage.classList.add('is-loading'); // removed again on the image's load event
  image.alt = meme.title;
  image.src = meme.url;
  document.getElementById('meme-link').href = meme.postLink || '#';
}

/* Rebuild the "Recent" filmstrip from history, marking the current frame. */
function renderHistory() {
  const strip = document.getElementById('meme-strip');
  strip.innerHTML = '';
  memeHistory.forEach((meme, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'meme-thumb';
    thumb.style.backgroundImage = 'url("' + meme.thumb + '")';
    thumb.setAttribute('aria-label', 'View this meme: ' + meme.title);
    thumb.setAttribute('aria-pressed', index === currentMemeIndex ? 'true' : 'false');
    thumb.addEventListener('click', () => setCurrentMeme(index));
    strip.appendChild(thumb);
  });
}

/* Jump back to a meme already in history (no new request). */
function setCurrentMeme(index) {
  if (index < 0 || index >= memeHistory.length) {
    return;
  }
  currentMemeIndex = index;
  renderMeme(memeHistory[index]);
  renderHistory();
  showMemeMessage('', false);
}

/* Pull a fresh meme, add it to the (max 6) history, and show it. Any failure is
   reported without breaking the page. */
async function showNewMeme() {
  if (isFetchingMeme) {
    return; // a request is already in flight
  }
  isFetchingMeme = true;
  memeButton.disabled = true;
  document.querySelector('.meme-stage').classList.add('is-loading');
  showMemeMessage('Pulling a fresh meme…', false);
  try {
    const meme = await nextMemeFromPool(selectedMemeSource());
    memeHistory.push(meme);
    if (memeHistory.length > MEME_HISTORY_MAX) {
      memeHistory.shift(); // drop the oldest so we keep at most 6
    }
    currentMemeIndex = memeHistory.length - 1;
    renderMeme(meme);
    renderHistory();
    showMemeMessage('', false);
  } catch (error) {
    document.querySelector('.meme-stage').classList.remove('is-loading');
    showMemeMessage('Could not load a meme. Check your connection and try again.', true);
  } finally {
    isFetchingMeme = false;
    memeButton.disabled = false;
  }
}

/* ============================================================
   Meme Maker mode — pull a BLANK template and let the user caption
   it themselves. This step loads and draws the plain template;
   captions, styling, dragging, and export come in later steps.
   ============================================================ */

/* The chosen caption-count category ('surprise', or a number as a string). */
function selectedMakerCategory() {
  return document.getElementById('maker-category').value;
}

/* Show a friendly message (or error) in the maker status line. */
function showMakerMessage(text, isError) {
  const status = document.getElementById('maker-status');
  status.textContent = text;
  status.classList.toggle('status--error', Boolean(isError));
}

/* Toggle the maker's "busy" state in one place: disable the New template button
   AND the category select (so a category change made mid-load isn't silently
   dropped), and dim the canvas while an image loads. */
function setMakerBusy(busy) {
  makerButton.disabled = busy;
  document.getElementById('maker-category').disabled = busy;
  makerCanvas.classList.toggle('is-loading', busy);
}

/* Fetch the catalogue of blank templates from Imgflip once and cache it. Each
   becomes { id, name, url, width, height, boxCount }. Throws on any failure so
   the caller can show a friendly message. */
async function fetchTemplates() {
  if (makerTemplates.length) {
    return makerTemplates; // already loaded — reuse the cache
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(IMGFLIP_API_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    const list = data && data.data && Array.isArray(data.data.memes) ? data.data.memes : [];
    makerTemplates = list
      .filter((t) => t && t.url && t.box_count)
      .map((t) => ({
        id: String(t.id),
        name: t.name || 'Template',
        url: t.url,
        width: t.width || 0,
        height: t.height || 0,
        boxCount: t.box_count,
      }));
    if (!makerTemplates.length) {
      throw new Error('No templates returned');
    }
    return makerTemplates;
  } finally {
    clearTimeout(timer);
  }
}

/* Fill the category dropdown from the templates we actually have: "Surprise me"
   plus one option per caption count present (2 captions, 3 captions, …). Building
   it from the data means the choices always match reality. */
function populateMakerCategories() {
  const select = document.getElementById('maker-category');
  // Don't add the same options twice if this runs again.
  if (select.dataset.filled === 'true') {
    return;
  }
  const counts = Array.from(new Set(makerTemplates.map((t) => t.boxCount)))
    .sort((a, b) => a - b);
  for (const count of counts) {
    const option = document.createElement('option');
    option.value = String(count);
    option.textContent = count + (count === 1 ? ' caption' : ' captions');
    select.appendChild(option);
  }
  select.dataset.filled = 'true';
}

/* The templates that match the chosen category. "surprise" is everything; a
   number keeps only templates with exactly that many caption boxes. */
function templatesForCategory(category) {
  if (category === 'surprise') {
    return makerTemplates;
  }
  const count = Number(category);
  return makerTemplates.filter((t) => t.boxCount === count);
}

/* Pick a random template from a category, avoiding an immediate repeat so the
   button always visibly changes something. */
function pickTemplate(category) {
  const pool = templatesForCategory(category);
  if (!pool.length) {
    return null;
  }
  if (pool.length === 1) {
    return pool[0];
  }
  const index = Math.floor(Math.random() * pool.length);
  let template = pool[index];
  if (currentTemplate && template.id === currentTemplate.id) {
    template = pool[(index + 1) % pool.length];
  }
  return template;
}

/* Size the maker canvas to match the template's aspect ratio (capped so a huge
   template doesn't make an enormous canvas), at 2x for a sharp export. */
function setupMakerCanvasFor(image) {
  const natW = image.naturalWidth || image.width;
  const natH = image.naturalHeight || image.height;
  const fit = Math.min(1, MAKER_MAX_SIZE / Math.max(natW, natH));
  makerLogicalW = Math.round(natW * fit);
  makerLogicalH = Math.round(natH * fit);
  const scale = Math.max(2, window.devicePixelRatio || 1);
  makerCanvas.width = makerLogicalW * scale;
  makerCanvas.height = makerLogicalH * scale;
  makerCtx.setTransform(scale, 0, 0, scale, 0, 0);
}

/* A friendly placeholder hint for each caption slot, based on its position. The
   classic top/bottom wording is recognizable; extra boxes are just numbered. */
function captionLabel(index, total) {
  if (total === 1) {
    return 'Caption';
  }
  if (index === 0) {
    return 'Top text';
  }
  if (index === total - 1) {
    return 'Bottom text';
  }
  return 'Text ' + (index + 1);
}

/* The current caption style. New captions copy this, and editing a caption's
   style updates it — so the next caption you add (or the next template's boxes)
   match what you last chose, instead of snapping back to the defaults. */
const captionStyle = {
  fontFamily: 'Impact, "Haettenschweiler", "Arial Narrow Bold", sans-serif',
  fillColor: '#ffffff',
  strokeColor: '#000000',
  fontScale: 0.12,         // font size as a fraction of canvas height
  uppercase: true,
};

/* Create one caption. Positions are stored as fractions (0..1) of the canvas, so
   they stay correct when the template — and therefore the canvas size — changes,
   and so dragging can move them. Style is copied from captionStyle. */
function makeCaption(label, nx, ny) {
  captionSeq += 1;
  return {
    id: captionSeq,
    label: label,
    text: '',
    nx: nx,                 // normalized center X
    ny: ny,                 // normalized center Y
    nWidth: 0.92,           // wrap width as a fraction of canvas width
    fontScale: captionStyle.fontScale,
    fontFamily: captionStyle.fontFamily,
    fillColor: captionStyle.fillColor,
    strokeColor: captionStyle.strokeColor,
    uppercase: captionStyle.uppercase,
    box: null,              // last drawn bounds (logical px) — used by dragging later
  };
}

/* Seed the editor with the right number of boxes for a template: a 1-box template
   gets one near the top, a 2-box gets the classic top + bottom, more are spread
   evenly down the image. */
function seedCaptions(count) {
  const total = Math.max(1, count || 1);
  captions = [];
  for (let i = 0; i < total; i += 1) {
    // Spread vertical centers from 14% (top) to 86% (bottom) of the canvas.
    const ny = total === 1 ? 0.16 : 0.14 + 0.72 * (i / (total - 1));
    captions.push(makeCaption(captionLabel(i, total), 0.5, ny));
  }
  selectedCaptionId = captions.length ? captions[0].id : null;
}

/* Draw one caption in the classic meme style: a thick outline (drawn first) with a
   solid fill on top, word-wrapped and centered on its point. Also records the
   block's bounds so a later step can hit-test it for dragging. Empty captions draw
   nothing. */
function drawCaption(context, caption) {
  const text = caption.uppercase ? caption.text.toUpperCase() : caption.text;
  if (!text.trim()) {
    caption.box = null;
    return;
  }
  const fontSize = Math.max(12, Math.round(caption.fontScale * makerLogicalH));
  context.font = '700 ' + fontSize + 'px ' + caption.fontFamily;
  context.textAlign = 'center';
  context.textBaseline = 'top';

  const maxWidth = caption.nWidth * makerLogicalW;
  const lines = wrapText(context, text, maxWidth);
  const lineHeight = fontSize * 1.08;
  const blockHeight = lines.length * lineHeight;
  const centerX = caption.nx * makerLogicalW;
  const topY = caption.ny * makerLogicalH - blockHeight / 2;

  // Outline settings — rounded joins keep the stroke clean on letter corners.
  context.lineJoin = 'round';
  context.miterLimit = 2;
  context.lineWidth = Math.max(2, fontSize * 0.14);
  context.strokeStyle = caption.strokeColor;
  context.fillStyle = caption.fillColor;

  let widest = 0;
  let y = topY;
  for (const line of lines) {
    widest = Math.max(widest, context.measureText(line).width);
    context.strokeText(line, centerX, y);
    context.fillText(line, centerX, y);
    y += lineHeight;
  }

  caption.box = { x: centerX - widest / 2, y: topY, w: widest, h: blockHeight };
}

/* Draw a dashed box around the selected caption so it's clear what you're about to
   move. This is on-screen chrome only — the export step redraws without it, so it
   never ends up in the downloaded PNG. */
function drawSelectionChrome() {
  const caption = getSelectedCaption();
  if (!caption || !caption.box) {
    return;
  }
  const pad = Math.max(6, makerLogicalH * 0.012);
  const b = caption.box;
  makerCtx.save();
  makerCtx.strokeStyle = 'rgba(47, 210, 155, 0.95)';
  makerCtx.lineWidth = Math.max(2, makerLogicalW / 400);
  makerCtx.setLineDash([Math.max(6, makerLogicalW / 120), Math.max(4, makerLogicalW / 180)]);
  makerCtx.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
  makerCtx.restore();
}

/* Repaint the whole maker scene: clear, the plain template, then every caption on
   top. Clearing first means transparent templates and moved captions never ghost.
   Pass withChrome=false to render the clean meme for export (no selection box). */
function drawMakerScene(withChrome) {
  if (!currentTemplateImage) {
    return;
  }
  makerCtx.clearRect(0, 0, makerLogicalW, makerLogicalH);
  makerCtx.drawImage(currentTemplateImage, 0, 0, makerLogicalW, makerLogicalH);
  for (const caption of captions) {
    drawCaption(makerCtx, caption);
  }
  if (withChrome !== false) {
    drawSelectionChrome();
  }
}

/* Rebuild the list of caption text boxes. Each row is an input (typing redraws the
   canvas live) plus a button to remove that caption. */
function renderCaptionList() {
  const list = document.getElementById('caption-list');
  list.innerHTML = '';
  captions.forEach((caption) => {
    const row = document.createElement('div');
    row.className = 'caption-row';
    row.dataset.id = caption.id;
    if (caption.id === selectedCaptionId) {
      row.classList.add('is-selected');
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'caption-input';
    input.value = caption.text;
    input.placeholder = caption.label;
    input.setAttribute('aria-label', caption.label);
    input.addEventListener('input', () => {
      caption.text = input.value;
      drawMakerScene();
    });
    // Clicking into a caption selects it, so the style controls target it.
    input.addEventListener('focus', () => selectCaption(caption.id));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'caption-remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove caption: ' + caption.label);
    remove.addEventListener('click', () => removeCaption(caption.id));

    row.appendChild(input);
    row.appendChild(remove);
    list.appendChild(row);
  });
  // Keep the style panel in sync with the (possibly new) selected caption.
  syncStyleControls();
}

/* Find the caption the style controls currently target, or null if none. */
function getSelectedCaption() {
  return captions.find((caption) => caption.id === selectedCaptionId) || null;
}

/* Make a caption the styling target: highlight its row and load its values into
   the style controls. It only toggles classes (no list rebuild), so it won't
   steal focus while you're typing in another field. */
function selectCaption(id) {
  selectedCaptionId = id;
  const rows = document.querySelectorAll('#caption-list .caption-row');
  rows.forEach((row) => {
    row.classList.toggle('is-selected', row.dataset.id === String(id));
  });
  syncStyleControls();
}

/* Load the selected caption's style into the controls — or disable them when no
   caption is selected (before a template loads, or after removing them all). */
function syncStyleControls() {
  const caption = getSelectedCaption();
  const font = document.getElementById('style-font');
  const size = document.getElementById('style-size');
  const fill = document.getElementById('style-fill');
  const stroke = document.getElementById('style-stroke');
  const upper = document.getElementById('style-upper');
  const target = document.getElementById('style-target');
  [font, size, fill, stroke, upper].forEach((el) => { el.disabled = !caption; });
  if (!caption) {
    target.textContent = '';
    return;
  }
  target.textContent = '— ' + caption.label;
  font.value = caption.fontFamily;
  size.value = String(caption.fontScale);
  fill.value = caption.fillColor;
  stroke.value = caption.strokeColor;
  upper.checked = caption.uppercase;
}

/* Apply a style change to the selected caption, remember it as the new default so
   future captions match, and repaint. */
function updateSelectedStyle(prop, value) {
  const caption = getSelectedCaption();
  if (!caption) {
    return;
  }
  caption[prop] = value;
  captionStyle[prop] = value;
  drawMakerScene();
}

/* Keep a number within a range. */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* Convert a pointer event's screen position into the canvas's logical coordinates.
   The canvas is shown shrunk to fit the layout, so we scale by its displayed size
   versus its logical size. */
function pointerToLogical(event) {
  const rect = makerCanvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (makerLogicalW / rect.width),
    y: (event.clientY - rect.top) * (makerLogicalH / rect.height),
  };
}

/* Find the topmost caption under a logical point (last drawn = on top), with a
   little padding so captions are easy to grab — especially with a finger. Empty
   captions (no drawn bounds) aren't hit. */
function captionAtPoint(lx, ly) {
  const pad = makerLogicalH * 0.02;
  for (let i = captions.length - 1; i >= 0; i -= 1) {
    const b = captions[i].box;
    if (b && lx >= b.x - pad && lx <= b.x + b.w + pad && ly >= b.y - pad && ly <= b.y + b.h + pad) {
      return captions[i];
    }
  }
  return null;
}

/* Begin dragging a caption. We listen on the window (not the canvas) for the rest
   of the drag, so the caption keeps following even if the pointer leaves the
   canvas. dragOffset keeps the grab point under the cursor instead of snapping the
   caption's center to it. */
function startCaptionDrag(caption, point) {
  draggingCaption = caption;
  dragOffsetX = caption.nx * makerLogicalW - point.x;
  dragOffsetY = caption.ny * makerLogicalH - point.y;
  makerCanvas.style.cursor = 'grabbing';
  window.addEventListener('pointermove', handleCaptionDragMove);
  window.addEventListener('pointerup', endCaptionDrag);
  window.addEventListener('pointercancel', endCaptionDrag);
}

function handleCaptionDragMove(event) {
  if (!draggingCaption) {
    return;
  }
  // If the mouse button was released outside the window we never got pointerup;
  // a move with no button held means the drag is over. (Touch keeps buttons=1.)
  if (event.buttons === 0) {
    endCaptionDrag(event);
    return;
  }
  const point = pointerToLogical(event);
  draggingCaption.nx = clamp((point.x + dragOffsetX) / makerLogicalW, 0, 1);
  draggingCaption.ny = clamp((point.y + dragOffsetY) / makerLogicalH, 0, 1);
  drawMakerScene();
}

function endCaptionDrag(event) {
  if (!draggingCaption) {
    return;
  }
  draggingCaption = null;
  window.removeEventListener('pointermove', handleCaptionDragMove);
  window.removeEventListener('pointerup', endCaptionDrag);
  window.removeEventListener('pointercancel', endCaptionDrag);
  // Restore the hover cursor: grab over a caption, default over empty canvas.
  if (event && typeof event.clientX === 'number') {
    handleMakerHover(event);
  } else {
    makerCanvas.style.cursor = 'default';
  }
}

/* Press on a caption to select and start dragging it. Focusing the canvas also
   enables the arrow-key nudge below. */
function handleMakerPointerDown(event) {
  if (!currentTemplateImage) {
    return;
  }
  // Focus the canvas on any press so the arrow-key nudge is reachable; preventScroll
  // stops mobile from jumping when you grab a caption near the bottom of the page.
  makerCanvas.focus({ preventScroll: true });
  const point = pointerToLogical(event);
  const caption = captionAtPoint(point.x, point.y);
  if (!caption) {
    return;
  }
  selectCaption(caption.id);
  startCaptionDrag(caption, point);
}

/* While not dragging, show a grab cursor when hovering a caption so it reads as
   draggable. */
function handleMakerHover(event) {
  if (draggingCaption) {
    return;
  }
  const point = pointerToLogical(event);
  makerCanvas.style.cursor = captionAtPoint(point.x, point.y) ? 'grab' : 'default';
}

/* Keyboard alternative to dragging: with the canvas focused, the arrow keys nudge
   the selected caption (hold Shift for a bigger step). */
function handleMakerCanvasKeydown(event) {
  const caption = getSelectedCaption();
  if (!caption) {
    return;
  }
  const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const delta = moves[event.key];
  if (!delta) {
    return;
  }
  event.preventDefault(); // don't scroll the page
  const step = event.shiftKey ? 0.05 : 0.01;
  caption.nx = clamp(caption.nx + delta[0] * step, 0, 1);
  caption.ny = clamp(caption.ny + delta[1] * step, 0, 1);
  drawMakerScene();
}

/* Build a friendly file name from the template's name, e.g. "Drake Hotline
   Bling" -> "drake-hotline-bling-meme.png". */
function makerFileName() {
  const name = currentTemplate && currentTemplate.name ? currentTemplate.name : 'meme';
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return (slug || 'meme') + '-meme.png';
}

/* Save the captioned meme as a PNG. We render once WITHOUT the selection box (the
   clean meme), capture the pixels, then restore the on-screen view. The canvas was
   loaded CORS-clean, so toDataURL works; its 2x backing store keeps the file sharp. */
function downloadMeme() {
  if (!currentTemplateImage) {
    showMakerMessage('Pick a template first, then add your captions.', false);
    return;
  }
  try {
    drawMakerScene(false); // clean meme, no selection chrome
    const link = document.createElement('a');
    link.download = makerFileName();
    link.href = makerCanvas.toDataURL('image/png');
    link.click();
    showMakerMessage('Saved your meme as a PNG.', false);
  } catch (error) {
    showMakerMessage('Sorry, the meme could not be saved. Please try again.', true);
  } finally {
    drawMakerScene(); // restore the on-screen selection box
  }
}

/* Add an extra caption (beyond the template's default boxes), centered, and focus
   it so the user can type right away. */
function addCaption() {
  const caption = makeCaption('Text ' + (captions.length + 1), 0.5, 0.5);
  captions.push(caption);
  selectedCaptionId = caption.id;
  renderCaptionList();
  drawMakerScene();
  const inputs = document.querySelectorAll('#caption-list .caption-input');
  if (inputs.length) {
    inputs[inputs.length - 1].focus();
  }
}

/* Remove a caption by id and repaint. */
function removeCaption(id) {
  captions = captions.filter((caption) => caption.id !== id);
  if (selectedCaptionId === id) {
    selectedCaptionId = captions.length ? captions[0].id : null;
  }
  renderCaptionList();
  drawMakerScene();
}

/* Paint a centered notice on the maker canvas over a soft gradient, so the canvas
   is never blank or stuck showing a stale "loading" message. Used for the
   first-load placeholder and for a load failure. */
function paintMakerNotice(text) {
  makerLogicalW = MAKER_MAX_SIZE;
  makerLogicalH = MAKER_MAX_SIZE;
  const scale = Math.max(2, window.devicePixelRatio || 1);
  makerCanvas.width = makerLogicalW * scale;
  makerCanvas.height = makerLogicalH * scale;
  makerCtx.setTransform(scale, 0, 0, scale, 0, 0);

  const stops = GRADIENTS[1];
  const gradient = makerCtx.createLinearGradient(0, 0, makerLogicalW, makerLogicalH);
  gradient.addColorStop(0, stops[0]);
  gradient.addColorStop(0.5, stops[1]);
  gradient.addColorStop(1, stops[2]);
  makerCtx.fillStyle = gradient;
  makerCtx.fillRect(0, 0, makerLogicalW, makerLogicalH);

  const size = Math.round(MAKER_MAX_SIZE / 22);
  makerCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  makerCtx.textAlign = 'center';
  makerCtx.textBaseline = 'middle';
  makerCtx.font = '600 ' + size + 'px system-ui, -apple-system, "Segoe UI", sans-serif';
  // Reuse the quote word-wrapper so a longer notice fits instead of clipping.
  const lines = wrapText(makerCtx, text, makerLogicalW * 0.8);
  const lineHeight = size * 1.3;
  let y = makerLogicalH / 2 - ((lines.length - 1) * lineHeight) / 2;
  for (const line of lines) {
    makerCtx.fillText(line, makerLogicalW / 2, y);
    y += lineHeight;
  }
}

/* Before the first template arrives, show a friendly placeholder. */
function drawMakerPlaceholder() {
  paintMakerNotice('Loading a blank template…');
}

/* If the catalogue can't be loaded at all, replace the placeholder with a clear,
   actionable message instead of a frozen "loading" canvas. */
function drawMakerError() {
  paintMakerNotice('Couldn’t load templates — press New template to try again.');
}

/* Mark which gallery thumbnail (if any) is the template on the canvas. Cheap —
   it only flips aria-pressed, it doesn't reload any images. */
function updateGallerySelection() {
  const thumbs = document.querySelectorAll('#maker-gallery .maker-thumb');
  thumbs.forEach((thumb) => {
    const selected = Boolean(currentTemplate) && thumb.dataset.id === currentTemplate.id;
    thumb.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
}

/* Rebuild the gallery for the chosen category. Each thumbnail is a button that
   loads that exact template. Images load lazily so a big category doesn't fetch
   dozens of pictures at once. */
function renderMakerGallery() {
  const gallery = document.getElementById('maker-gallery');
  const pool = templatesForCategory(selectedMakerCategory());
  gallery.innerHTML = '';
  for (const template of pool) {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'maker-thumb';
    thumb.dataset.id = template.id;
    thumb.title = template.name;
    thumb.setAttribute('aria-label', 'Use template: ' + template.name);
    thumb.setAttribute(
      'aria-pressed',
      Boolean(currentTemplate) && template.id === currentTemplate.id ? 'true' : 'false'
    );
    const img = document.createElement('img');
    // Request the thumbnail CORS-clean too (crossOrigin before src), so a cached
    // gallery image can't taint the canvas when the same URL is drawn for export.
    img.crossOrigin = 'anonymous';
    img.alt = '';
    img.loading = 'lazy';
    img.src = template.url;
    thumb.appendChild(img);
    thumb.addEventListener('click', () => selectTemplate(template));
    gallery.appendChild(thumb);
  }
}

/* Core loader: put a specific template on the canvas. No re-entrancy guard — the
   callers below hold it. Loads the image CORS-clean so the canvas can be exported
   later. Throws on failure so the caller can show the right message. */
async function applyTemplate(template) {
  const image = await loadImage(template.url, 'anonymous');
  currentTemplate = template;
  currentTemplateImage = image;
  setupMakerCanvasFor(image);
  // Start fresh with the right number of caption boxes for this template.
  seedCaptions(template.boxCount);
  renderCaptionList();
  drawMakerScene();
  makerCanvas.setAttribute(
    'aria-label',
    'Blank meme template: ' + template.name + ' — add your own captions'
  );
  updateGallerySelection();
}

/* Load a specific template chosen from the gallery. */
async function selectTemplate(template) {
  if (isFetchingMaker) {
    return; // a load is already in flight
  }
  isFetchingMaker = true;
  setMakerBusy(true);
  showMakerMessage('Loading template…', false);
  try {
    await applyTemplate(template);
    showMakerMessage('', false);
  } catch (error) {
    showMakerMessage('That template would not load. Try another one.', true);
  } finally {
    isFetchingMaker = false;
    setMakerBusy(false);
  }
}

/* Make sure the catalogue is loaded, then show a random template from the chosen
   category. One "busy" span covers both the catalogue fetch and the image load,
   so the button and select don't flicker. Reports any failure gracefully. */
async function showNewTemplate() {
  if (isFetchingMaker) {
    return;
  }
  isFetchingMaker = true;
  setMakerBusy(true);
  showMakerMessage(makerTemplates.length ? 'Loading template…' : 'Loading templates…', false);
  try {
    if (!makerTemplates.length) {
      await fetchTemplates();
      populateMakerCategories();
      renderMakerGallery();
    }
    const template = pickTemplate(selectedMakerCategory());
    if (!template) {
      showMakerMessage('No templates in that category — try another.', false);
      return;
    }
    await applyTemplate(template);
    showMakerMessage('', false);
  } catch (error) {
    if (!currentTemplate) {
      drawMakerError(); // first load failed — replace the "loading" placeholder
    }
    showMakerMessage('Could not load templates. Check your connection and try again.', true);
  } finally {
    isFetchingMaker = false;
    setMakerBusy(false);
  }
}

/* Changing the category rebuilds the gallery and rolls a fresh template from it. */
function handleMakerCategoryChange() {
  renderMakerGallery();
  showNewTemplate();
}

/* Switch between Quote, Memes, and Maker modes, lazy-loading each mode's first
   content the first time it's opened. */
function setMode(mode) {
  currentMode = mode;
  document.getElementById('quote-panel').hidden = mode !== 'quote';
  document.getElementById('meme-panel').hidden = mode !== 'meme';
  document.getElementById('maker-panel').hidden = mode !== 'maker';
  document.getElementById('mode-quote').setAttribute('aria-pressed', String(mode === 'quote'));
  document.getElementById('mode-meme').setAttribute('aria-pressed', String(mode === 'meme'));
  document.getElementById('mode-maker').setAttribute('aria-pressed', String(mode === 'maker'));

  if (mode === 'meme' && memeHistory.length === 0) {
    showNewMeme();
  }
  if (mode === 'maker' && !currentTemplate) {
    drawMakerPlaceholder(); // never show a blank canvas while the first one loads
    showNewTemplate();
  }
}

/* Wire up the controls and draw the first quote so the screen is never blank. */
function init() {
  newQuoteButton = document.getElementById('new-quote');
  newQuoteButton.addEventListener('click', showNewQuote);
  document.getElementById('download').addEventListener('click', downloadImage);
  document.getElementById('image-input').addEventListener('change', handleImageChange);
  document.addEventListener('keydown', handleKeydown);

  // The "Live quotes" toggle: reflect the default, then keep liveMode in sync.
  const liveToggle = document.getElementById('live-toggle');
  liveToggle.checked = liveMode;
  liveToggle.addEventListener('change', handleLiveToggle);

  // Wire each gradient swatch to switch the background when clicked.
  swatchButtons = Array.from(document.querySelectorAll('.swatch'));
  for (const swatch of swatchButtons) {
    swatch.addEventListener('click', () => selectGradient(Number(swatch.dataset.gradient)));
  }

  // --- Mode switcher wiring ---
  document.getElementById('mode-quote').addEventListener('click', () => setMode('quote'));
  document.getElementById('mode-meme').addEventListener('click', () => setMode('meme'));
  document.getElementById('mode-maker').addEventListener('click', () => setMode('maker'));
  memeButton = document.getElementById('meme-new');
  memeButton.addEventListener('click', showNewMeme);
  // Changing the category pulls a fresh meme from it right away.
  document.getElementById('meme-source-select').addEventListener('change', showNewMeme);
  // Clear the loading state once the image actually arrives (or report a failure).
  const memeImage = document.getElementById('meme-image');
  memeImage.addEventListener('load', () => {
    document.querySelector('.meme-stage').classList.remove('is-loading');
  });
  memeImage.addEventListener('error', () => {
    document.querySelector('.meme-stage').classList.remove('is-loading');
    showMemeMessage('That meme image would not load. Try another one.', true);
  });

  // --- Maker mode wiring ---
  makerButton = document.getElementById('maker-new');
  makerButton.addEventListener('click', showNewTemplate);
  document.getElementById('maker-category').addEventListener('change', handleMakerCategoryChange);
  document.getElementById('caption-add').addEventListener('click', addCaption);
  document.getElementById('maker-download').addEventListener('click', downloadMeme);

  // Style controls act on the selected caption (and become the default for new ones).
  document.getElementById('style-font')
    .addEventListener('change', (e) => updateSelectedStyle('fontFamily', e.target.value));
  document.getElementById('style-size')
    .addEventListener('input', (e) => updateSelectedStyle('fontScale', parseFloat(e.target.value)));
  document.getElementById('style-fill')
    .addEventListener('input', (e) => updateSelectedStyle('fillColor', e.target.value));
  document.getElementById('style-stroke')
    .addEventListener('input', (e) => updateSelectedStyle('strokeColor', e.target.value));
  document.getElementById('style-upper')
    .addEventListener('change', (e) => updateSelectedStyle('uppercase', e.target.checked));

  // Drag captions on the canvas (pointer events cover mouse + touch); arrow keys
  // nudge the selected caption when the canvas is focused.
  makerCanvas.addEventListener('pointerdown', handleMakerPointerDown);
  makerCanvas.addEventListener('pointermove', handleMakerHover);
  makerCanvas.addEventListener('keydown', handleMakerCanvasKeydown);

  // Start on a random gradient so the default state has some variety.
  currentGradientIndex = Math.floor(Math.random() * GRADIENTS.length);
  currentQuote = getRandomQuote();
  updateSwatchSelection();
  setupCanvas();   // size the high-resolution canvas once
  drawQuoteImage();
}

init();
