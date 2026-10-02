# Afterdawn — Creative Studio Website

A single-page creative studio website for **Afterdawn**, a production company offering film production, photoshoots, branding, digital marketing, and social media services. The design is built around a dramatic cinematic hero with a video background, followed by a vertically stacked editorial layout of services, work, and contact sections. The visual language is dark, confident, and editorial.

> **⚠️ Important:** This is a dummy project created for demonstration and portfolio purposes. Afterdawn Studio is not a real company, and all contact information is fictional.

**Live Demo:** Open `index.html` in a modern browser.

---

## Features

- **Cinematic Hero** — Full-viewport hero with looping video background, gradient overlay, and staggered word-reveal animation
- **Smooth Scrolling** — Custom smooth-scroll implementation using GSAP ScrollTrigger (no paid plugins required)
- **Scroll-Triggered Animations** — GSAP-powered reveals, parallax, and counter animations throughout
- **Custom Cursor** — Blend-mode cursor with hover states for links, buttons, and project cards
- **Service Hover Previews** — Contextual images fade in on service row hover
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
| Google Fonts | Space Grotesk + Inter |

---

## Project Structure

```
.
├── index.html          # Main page
├── styles.css          # All styles (tokens → layout → components → motion)
├── script.js           # All JavaScript (smooth scroll, cursor, animations, form)
├── PRD.md              # Product Requirements Document (design spec)
└── README.md           # This file
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
| **Hero** | Full-viewport video background with headline, subheadline, and CTAs |
| **Services** | 5 service rows with hover image previews |
| **Selected Work** | Asymmetric 2-column project grid with parallax images |
| **About** | Studio story with stats counter animation |
| **Testimonials** | 3 client testimonial cards |
| **Contact** | Contact info + functional contact form |
| **Footer** | Copyright, logo mark, privacy/terms links |

---

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#1A1A1A` | Main page background |
| `--bg-secondary` | `#242424` | Card backgrounds |
| `--text-primary` | `#F5F0E8` | Main headings, body text |
| `--text-secondary` | `#B8B0A4` | Captions, metadata |
| `--accent` | `#E85D4E` | CTAs, links, highlights |

### Typography

- **Display/Headings:** Space Grotesk (500–700)
- **Body:** Inter (400–500)
- Fluid type scale using CSS `clamp()`

---

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari / Chrome

---

## Credits

- Design & Development: Afterdawn Studio
- Images: [Unsplash](https://unsplash.com)
- Fonts: [Google Fonts](https://fonts.google.com)
- Animation: [GSAP](https://greensock.com/gsap/)

---

## License

© 2025 Afterdawn Studio. All rights reserved.

