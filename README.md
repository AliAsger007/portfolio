# Ali Asger — e-portfolio (v2)

A hand-written developer portfolio. No framework, no build step, no npm install.
Open `index.html` and it works.

Version 2 replaced the editorial look with an engineer's workspace. Version 3 adds an interactive
3D wireframe globe in the hero (canvas, no libraries) and a working contact area.

---

## Look at it

Double-click **`index.html`**.

| File | What it is |
|---|---|
| `index.html` | The portfolio — hero, about, stack, work, CV, contact |
| `resume.html` | One-page CV that prints cleanly to PDF |
| `css/styles.css` | All styling. Colour, type and spacing live in tokens at the top |
| `css/chat.css` | Styles for the chat assistant only |
| `js/main.js` | Theme, mobile menu, reveals, active nav, `T` shortcut |
| `js/scene.js` | The 3D hero globe and the terminal tilt — plain canvas maths |
| `js/cv.js` | Opens the CV in an overlay, one click |
| `js/chat.js` | The assistant's knowledge base, matcher and UI |
| `assets/favicon.svg` | The tab icon |
| `CONTENT.md` | Bio drafts, case-study copy, outreach message |

**Shortcuts:** press <kbd>T</kbd> anywhere to flip dark/light. The choice is remembered.

---

## The edits you'll actually want

### 1. Your email is already wired up
`aliudaipur5312@gmail.com` is used in five places: the contact buttons, the contact list, the
pre-filled `mailto:` subject, the CV header, and the chat assistant's answer. To change it, search
the folder for that address and replace every hit.

**How it behaves:** the Email button opens the visitor's own mail app with a subject and greeting
already filled in. It does not send from the website — nothing on a static site can do that without
a service. If you want an in-page form that sends by itself, sign up for
[Formspree](https://formspree.io) (free tier) or use Netlify Forms, and point a `<form>` at their
endpoint. That replaces the button, not the rest of the section.

### 2. Activate the LinkedIn button
The button exists and is styled, but intentionally disabled — there's no URL yet, and a dead link
is worse than no link. In `index.html`, find the `LINKEDIN:` comment in the Contact section, then:

1. Delete the `<span class="cbtn is-pending">…</span>` block.
2. Uncomment the `<a class="cbtn" …>LinkedIn</a>` above it.
3. Paste your profile URL into its `href`.

Also add a row to the contact list if you want it there:

```html
<li><span class="k">LinkedIn</span><span class="v"><a href="https://linkedin.com/in/your-handle" target="_blank" rel="noopener">/in/your-handle</a></span></li>
```

### 3. Confirm your name
The site reads **Ali Asger**, with Udaipur as your hometown. If *Udaipur* belongs in your name,
change it in three places: the `<h1>` in `index.html`, the `<h1>` in `resume.html`, and the
`"name"` field in the JSON-LD block at the top of `index.html`.

### 4. Re-skin it in one line each
Top of `css/styles.css`:

```css
--accent: #5eead4;    /* dark theme  */
--accent: #0d7e72;    /* light theme */
```

Fonts are **Space Grotesk** (headings), **Inter** (body), **JetBrains Mono** (labels and code),
loaded from Google Fonts with system fallbacks.

### 5. Add a second project
The Work section is one `<article class="case">`. To add another, copy that whole block below the
first one and change: the `.case-kicker`, the `<h3>`, the `.chip` label, `.case-lede`, the four
`.flow li` steps, the two `.module` cards, and the `.spec` rows. Two case studies is the
right maximum — after that the page stops being readable.

---

## The portfolio assistant

The floating **"Ask about Ali"** button opens a chat that answers questions about your background,
the Student Management System, your skills, availability and how to reach you.

**How it works:** it is not connected to an AI service. `js/chat.js` holds a knowledge base of
intents, each with keywords and a written answer. Your question is scored against those keywords
and the best match is returned — no network request, no API key, no data leaving the page, and it
works offline.

**It is honest about itself.** Ask "are you a real person?" and it says it's a script that answers
from the portfolio, not you.

**To teach it something new**, add an entry to the `KB` array in `js/chat.js`:

```js
{
  id: 'certifications',
  keys: [['certificate', 6], ['certification', 6]],
  answer: 'No certifications listed yet — the portfolio only claims what is finished.',
  chips: ['What are his skills?', 'How do I contact him?']
},
```

Rules that matter:

- Multi-word keys match as substrings; single words match whole tokens; words of 4+ characters also
  match as prefixes, so `project` catches "projects".
- Higher weights beat lower ones, and **earlier entries win ties** — keep specific intents above
  generic ones.
- Answers support `**bold**` and `[link text](url)`. Everything else is inserted as plain text, so
  user input can never inject markup.
- `chips` are the suggested follow-up questions shown under the reply.

### If you later want a real LLM

You cannot put an API key in `chat.js` — anyone can read it. The minimum upgrade is a tiny server
route (Cloudflare Worker, Netlify Function) that holds the key and forwards the question, then
change `answerFor()` to `fetch` that endpoint and return the text. Keep the knowledge base as the
fallback for when the request fails. Nothing else in the widget needs to change.

---

## The 3D hero

The hero draws a wireframe globe on `<canvas>` — real sphere geometry, rotated in 3D and projected
with a perspective divide. `js/scene.js` is roughly 240 lines with no libraries.

- **Interactive:** move the pointer across the hero and the globe leans toward it; the terminal card
  tilts with it, capped at about 3.5°.
- **Tuning:** `MERIDIANS`, `PARALLELS` and `NODES` at the top of `scene.js` set how dense it is.
  Rotation speed is the `angle += dt * 0.00016` line. Size and centre come from `R`, `cx`, `cy`
  inside `resize()` — below 900px it centres itself and shrinks.
- **Performance:** pauses when the hero is off-screen or the tab is hidden, caps device pixel ratio
  at 2, and batches each depth band into one `stroke()` call instead of one per line.
- **Accessibility:** under `prefers-reduced-motion` it paints a single still frame and never moves.
- **Removing it:** delete the `<canvas id="hero-canvas">` element and the `scene.js` script tag.
  Nothing else depends on it.

---

## Put it online

### GitHub Pages (recommended)

1. New repository named **`portfolio`** (or `AliAsger007.github.io` for the shorter URL).
2. Upload the **contents** of this folder, keeping `css/`, `js/` and `assets/` as folders.
3. **Settings → Pages → Source: Deploy from a branch**, branch **`main`**, folder **`/ (root)`** → Save.
4. Wait a minute; the URL appears at the top of that page.

Every link is relative, so either repo name works without edits.

### Netlify

Drag this folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Instant URL, custom
domain later.

---

## The CV

**View CV** (hero and CV section) opens the résumé in an overlay on the same page — one click, no
download, no navigation. It is plain HTML inside `index.html`, not a PDF and not an iframe, so it
renders in every browser and straight from `file://`.

Inside: **Open in tab** (the full printable page) and **Close**. `Esc` also closes it, and focus
returns to the button that opened it.

**The CV lives in two places** — keep them in sync when something changes:

| Where | What it is |
|---|---|
| `index.html` → `.cv-body` | the overlay version, styled as a white sheet |
| `resume.html` | the standalone page, built for printing |

**To make a PDF:** View CV → Open in tab → Print / Save as PDF → **A4**, default margins.
The toolbar and grey background are removed in print automatically.

---

## What's built in

- Semantic landmarks, skip link, visible focus rings, labelled icon buttons
- `aria-expanded` on the mobile menu, `aria-current` on the active nav link
- `prefers-reduced-motion` respected; reveals disabled, animations stopped
- Active-section tracking, theme persistence, <kbd>T</kbd> theme shortcut
- `og:` tags, `Person` JSON-LD with email, theme-aware `theme-color`
- 3D hero globe: pointer-reactive, pauses off-screen, still frame under reduced motion
- Chat widget: keyboard accessible, `Esc` closes it, focus returns to the button, messages
  announced via `aria-live`, disabled motion respected
- No dependencies, no tracking, no cookies

---

## Honest by design

One real project, described accurately — not three invented ones. The "Under the hood" panel
says the code is **available on request**, which is true and sounds deliberate.

**The one thing that would strengthen this most:** publish the Student Management System to
GitHub with a short README (screenshot, schema diagram, how to run it), then change that spec row
to a link. A recruiter who can read the code trusts the rest of the page more.

Everything else — the stack cards, the notes under each skill — is scoped to what you can actually
do today. Keep it that way; it ages better than a wall of logos.
