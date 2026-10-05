# Afterdawn — Film Production Studio

A single-page film production studio website for **Afterdawn**, specializing in intimate human stories. From concept to final cut, we handle every frame with intention.

> **⚠️ Important:** This is a dummy project created for demonstration and portfolio purposes. Afterdawn Studio is not a real company, and all contact information is fictional.

**Live Demo:** Open `index.html` in your browser.

---

## Features

- **Cinematic Hero** — Full-viewport hero with looping background slideshow, gradient overlay, and staggered word-reveal animation
- **Desktop Smooth Scroll** — Custom smooth-scroll implementation using GSAP ScrollTrigger (native search on mobile)
- **Scroll-Triggered Animations** — GSAP-powered reveals, parallax, and counter animations throughout
- **Custom Cursor** — Blend-mode cursor with hover states for links, buttons, and project cards
- **Service Row Previews** — Contextual images fade in on service row hover (desktop only)
- **8-Card Staggered Portfolio** — Asymmetric 2-column grid with parallax images
- **Brand System** — Complete logo mark, favicon, and brand-kit presentation board
- **Responsive Design** — Fully responsive with mobile hamburger menu, touch-optimized interactions
- **Accessibility** — Skip link, focus states, reduced-motion support, semantic HTML

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup |
| CSS3 | Custom properties, grid, flexbox, animations |
| Vanilla JavaScript | Interactions, animations, form handling |
| [GSAP](https://greensock.com/gsap/) + ScrollTrigger | Animations and scroll triggers |
| [Splitting.js](https://splitting.js.org/) | Text splitting for word animations |
| Google Fonts |
| SVG | Vector logo marks and favicon |

---

## Project Structure

```
afterdawn/
├── index.html              # Main page (updated logo paths: logo/favicon.svg)
├── styles.css              # All styles (tokens → layout → components → motion)
├── script.js               # All JavaScript (smooth scroll, cursor, animations, form)
├── logo/                   # Brand assets folder
│   ├── logo.svg            # Primary mark (film-frame + dawn glow)
│   ├── favicon.svg         # Browser tab icon (dark rounded square)
│   └── brandkit.html       # Presentation board for decks
└── README.md               # This file
```

---

## Quick Start

1. Clone or download the repository
2. Open `index.html` in a modern browser
3. No build step required — it's a static site

> **Note:** The site uses CDN links for GSAP, ScrollTrigger, and Splitting.js. An internet connection is required on first load.

---

## Sections

| Section | Description |
|---------|-------------|
| **Hero** | Full-viewport background slideshow with headline, subheadline, and CTAs |
| **Services** | 6 film service rows (Story Development, Pre-Production, Production, Post-Production, Visual Effects, Release & Festival) with hover previews |
| **Selected Work** | 8 film project cards in staggered 2-column grid with parallax images |
| **About** | Studio story with stats counter animation (8 Films / 6 Services / 5 Stages) |
| **Testimonials** | 3 film-related client quotes — Producer, Director, Executive Producer |
| **Contact** | Contact info + form renamed to "Format" (Short Film / Feature Film / Documentary / Music Video / Other) |
| **Footer** | Copyright, logo mark, privacy/terms links |

---

8 concept film projects displayed in a staggered masonry layout:

- Aftersun (2022) — Cinematography & Color Grading
- Past Lives (2023) — Direction & Editing
- Project Hail Mary (2026) — VFX & Sound Design
- Marty Supreme (2025) — Production & Casting
- The Worst Person in the World (2021) — Screenwriting & Editing
- 500 Days of Summer (2009) — Music & Sound Design
- 18x2 Beyond Youthful Days (2024) — Cinematography & Post-Production
- Sore (2025) — Direction & Production Design

> **Note:** Film titles are shown as portfolio mockups (concept work).


## Credits

- Design & Development: Afterdawn Studio
- Images: [Unsplash](https://unsplash.com), [Pinterest](https://pinterest.com)
- Fonts: [Google Fonts](https://fonts.google.com)
- Animation: [GSAP](https://greensock.com/gsap/)

---

## License

© 2025 Afterdawn Studio. All rights reserved.
