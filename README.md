# GoldMine — Premium Gaming Platform (Static Website)

A small **static showcase website** about video games featuring a catalog, filters, and detailed game information powered by the **RAWG.io API**. Supports light/dark mode, animations, tooltips, and persistent user settings in the browser.

---

## Pages
- `index.html` — Home page: carousel, counters, news, and features.  
- `Gamelist.html` — Game catalog integrated with RAWG: search, sorting, filters, wishlist, and modal details.  
- `about.html` — About the project.  
- `contact.html` — Contact page.  
- `register.html` — Registration form (validation and password strength indicator).

> Note: pages such as `news1.html`, `news2.html`, `news3.html`, and `game.html` may exist as templates or placeholders.

---

## Key Features
- Theme switcher (light/dark) with persistence in `localStorage` and cookies, plus theme parameter transfer between pages.  
- Top scroll progress indicator with highlight animation.  
- Live search with autocomplete and keyboard navigation (jQuery).  
- Highlighting of text matches in articles.  
- UI components: carousels, accordions, popups, and improved form UX.  
- Real-time display of current date and time on the page and in the navbar.  
- RAWG catalog integration:
  - Search by title, sorting (added/released/rating/Metacritic/name).
  - Filters: platforms, release year (range), “wishlist only”.
  - Wishlist stored in `localStorage`.
  - Game modal with overview, metadata, media (screenshots, trailers), and store links.
  - Lightbox for screenshots and platform badges.

---

## Technologies
- HTML5, CSS3  
- Bootstrap 5.3  
- jQuery 3.7  
- RAWG.io API (public games catalog)

---

## Quick Start
1. Download or clone the repository.  
2. Open `index.html` in your browser (double-click) or run via a local server (e.g., VS Code Live Server).  
3. To enable the RAWG catalog, provide your API key (see below).

---

## RAWG API Key Setup
The site looks for an API key in the following order:
1. `window.APIKEY` from `dev.env.js`.
2. `localStorage.getItem('rawg.key')`.

**Options for connecting the key:**
- **Using a file:** create a file named `dev.env.js` in the project root:
  ```js
  window.APIKEY = 'YOUR_RAWG_API_KEY';
