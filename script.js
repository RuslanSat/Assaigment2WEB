// Assignment Demo JavaScript (unique selectors)
if (window.jQuery) $(document).ready(function () {
    console.log("jQuery is ready!");

    // Live Search: real-time filter on keyup/input
    const $input = $('#live-search-input');
    const $listItems = $('#live-search-list .live-item');
    const $count = $('#live-search-count');
    const $clear = $('#live-search-clear');
    // Autocomplete suggestions container
    let $suggestions = $('#live-search-suggestions');
    if (!$suggestions.length && $input.length) {
        $suggestions = $('<ul id="live-search-suggestions" class="list-group mt-1"></ul>');
        $input.after($suggestions);
    }

// Standalone GameBrain initializer (runs when jQuery blocks are skipped)
(function(){
    if (window.__gbInitDone) return; // prevent double init
    const grid = document.getElementById('gamebrain-grid');
    if (!grid) return;
    window.__gbInitDone = true;

    const baseInput = document.getElementById('gb-base-url');
    const keyInput = document.getElementById('gb-api-key');
    const saveBtn = document.getElementById('gb-save-config');
    const clearBtn = document.getElementById('gb-clear-config');
    const searchBtn = document.getElementById('gb-search-btn');
    const queryInput = document.getElementById('gb-query');
    const loadMoreBtn = document.getElementById('gb-load-more');
    const genreSelect = document.getElementById('gb-genre');
    const limitInput = document.getElementById('gb-limit');

    const endpointList = grid.getAttribute('data-endpoint-list') || '/api/search/games';
    const endpointSearch = grid.getAttribute('data-endpoint-search') || '/api/search/games';

    let gbBase = localStorage.getItem('gb.base') || 'https://gamebrain.co';
    let gbKey = localStorage.getItem('gb.key') || '';
    let page = 1;
    let lastQuery = '';
    let isLoading = false;

    if (baseInput) baseInput.value = gbBase;
    if (keyInput) keyInput.value = gbKey ? '••••••••' : '';

    function setStatus(loading) {
        isLoading = loading;
        if (searchBtn) searchBtn.disabled = loading;
        if (loadMoreBtn) loadMoreBtn.disabled = loading;
    }
    function getHeaders() {
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (gbKey) { headers['Authorization'] = 'Bearer ' + gbKey; headers['X-API-Key'] = gbKey; }
        return headers;
    }
    function normalizeGames(data) {
        const list = Array.isArray(data) ? data
            : (Array.isArray(data?.games) ? data.games
            : (Array.isArray(data?.results) ? data.results
            : (Array.isArray(data?.items) ? data.items : [])));
        return list.map(g => {
            const title = g.title || g.name || g.slug || 'Untitled';
            const desc = g.short_description || g.description || g.summary || g.tagline || '';
            // rating.mean comes 0..1; convert to 0..100 and 0..5 stars proxy
            const mean = (typeof g.rating === 'object' && typeof g.rating.mean === 'number') ? g.rating.mean : (typeof g.rating === 'number' ? g.rating : null);
            const rating100 = mean != null && mean <= 1 ? Math.round(mean * 100) : (mean != null ? Math.round(mean) : null);
            const ratingStars = rating100 != null ? Math.round((rating100 / 100) * 5) : null;
            const genres = Array.isArray(g.genres) ? g.genres : (g.genre ? [g.genre] : (g.tags || []));
            const genreStr = g.genre || (Array.isArray(g.genres) ? g.genres[0] : '') || '';
            const ratingCount = (typeof g.rating === 'object' && typeof g.rating.count === 'number') ? g.rating.count : (typeof g.reviews === 'number' ? g.reviews : null);
            const platforms = Array.isArray(g.platforms) ? g.platforms.map(p => (p.name || p).toString()).slice(0,3) : [];
            const img = g.image || g.cover || g.thumbnail || (g.images && (g.images.cover || g.images[0])) || '';
            const url = g.link || g.url || '#';
            const adult = !!g.adult_only;
            const year = g.year || g.release_year || null;
            const screenshots = Array.isArray(g.screenshots) ? g.screenshots : [];
            const microTrailer = g.micro_trailer || '';
            const gameplay = g.gameplay || '';
            const id = g.id || (g.slug || title);
            return { id, title, desc, rating100, ratingStars, ratingCount, genres, genreStr, platforms, img, url, adult, year, screenshots, microTrailer, gameplay };
        });
    }
    function starRow(stars) {
        if (stars == null) return '';
        const s = Math.max(0, Math.min(5, stars));
        return '<span class="text-warning">' + '★'.repeat(s) + '<span class="text-muted">' + '☆'.repeat(5 - s) + '</span></span>';
    }
    function badgeList(items) {
        if (!items || !items.length) return '';
        return items.map(txt => '<span class="badge bg-secondary me-1">'+String(txt)+'</span>').join('');
    }
    function kFormat(n){ if(typeof n!=='number') return ''; if(n>=1000000) return (n/1000000).toFixed(1)+'m'; if(n>=1000) return (n/1000).toFixed(1)+'k'; return String(n); }
    function cardHTML(item) {
        const imgSrc = item.img || 'images/placeholder-game.png';
        const genres = Array.isArray(item.genres) ? item.genres.slice(0, 3) : [];
        const platforms = item.platforms || [];
        const percent = (typeof item.rating100==='number') ? (item.rating100+'%') : '';
        const reviews = (typeof item.ratingCount==='number') ? (kFormat(item.ratingCount)+' reviews') : '';
        const sub = [item.year, item.genreStr].filter(Boolean).join(' · ');
        const adultOverlay = item.adult ? ('<div class="gb-adult" data-id="'+item.id+'"><div>Site contains adult content</div><button class="btn btn-success btn-sm gb-adult-enable">Enable adult content</button></div>') : '';
        return '<div class="col">\
          <div class="card gb-card h-100">\
            <div class="gb-toolbar-actions">\
              <button class="gb-action gb-action-wishlist" title="Add to wishlist">🔖</button>\
              <button class="gb-action" title="Like">👍</button>\
              <button class="gb-action" title="Share">🔗</button>\
            </div>\
            <img loading="lazy" src="'+imgSrc+'" class="card-img-top gb-img" alt="'+item.title+'" onerror="this.src=\'images/placeholder-game.png\'">\
            '+(percent?('<div class="gb-rating"><div>'+percent+'</div><small>'+reviews+'</small></div>'):'')+'\
            '+adultOverlay+'\
            <div class="gb-meta-strip">\
              <h5 class="gb-title">'+item.title+'</h5>\
              <div class="gb-sub">'+(sub||'')+'</div>\
              <div class="gb-pills">'+(platforms.slice(0,3).map(p=>'<span class="gb-pill">'+p+'</span>').join(''))+(platforms.length>3?'<span class="gb-pill gb-plus">+'+(platforms.length-3)+'</span>':'')+'</div>\
              <div class="d-flex gap-2 mt-2">\
                <a href="'+item.url+'" target="_blank" rel="noopener" class="btn btn-outline-light btn-sm">Open</a>\
                <button class="btn btn-primary btn-sm gb-details" data-id="'+item.id+'">Details</button>\
              </div>\
            </div>\
          </div>\
        </div>';
    }
    function renderGames(list, append) {
        const html = list.map(cardHTML).join('');
        if (append) grid.insertAdjacentHTML('beforeend', html); else grid.innerHTML = html;
        const badge = document.getElementById('gb-result-count');
        if (badge) badge.textContent = list.length ? (list.length + ' results') : '';
    }

    function renderSkeletons(count){
        const cols = new Array(count).fill(0).map(()=>'<div class="col"><div class="card h-100 game-bootstrap-card"><div class="gb-skeleton" style="height:160px"></div><div class="card-body"><div class="gb-skeleton mb-2" style="height:18px"></div><div class="gb-skeleton" style="height:48px"></div></div></div></div>').join('');
        grid.innerHTML = cols;
    }
    async function fetchGames(opts) {
        const q = (opts && opts.q) || '';
        const pageNum = (opts && opts.pageNum) || 1;
        if (!gbBase) return { items: [], next: false, error: 'Missing base URL' };
        setStatus(true);
        if (!q) { setStatus(false); return { items: [], next: false, error: '' }; }
        try {
            const url = new URL(endpointSearch, gbBase);
            url.searchParams.set('name', q);
            const res = await fetch(url.toString(), { headers: getHeaders() });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            const items = normalizeGames(data);
            const total = Array.isArray(data?.games) ? data.games.length : (Array.isArray(items) ? items.length : undefined);
            const next = false;
            return { items, next, total };
        } catch (err) {
            console.error('GameBrain fetch error:', err);
            return { items: [], next: false, error: String(err) };
        } finally { setStatus(false); }
    }
    async function runSearch(reset) {
        if (reset) { page = 1; lastQuery = (queryInput?.value || '').trim(); localStorage.setItem('gb.query', lastQuery); }
        if (!lastQuery) {
            grid.innerHTML = '<div class="col"><div class="alert alert-info">Enter a game name above and press Search.</div></div>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }
        const { items, next, error, total } = await fetchGames({ q: lastQuery, pageNum: page });
        if (error) {
            grid.innerHTML = '<div class="col"><div class="alert alert-danger">GameBrain request failed: ' + error.replace(/</g,'&lt;') + '</div></div>';
            if (!gbKey) grid.insertAdjacentHTML('beforeend','<div class="col"><div class="alert alert-warning">Please set your GameBrain API base URL and API key, then click Search.</div></div>');
            return;
        }
        if (reset) renderGames(items); else renderGames(items, true);
        if (next) {
            if (loadMoreBtn) loadMoreBtn.style.display = 'block';
        } else {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
    }
    if (saveBtn) saveBtn.addEventListener('click', function(){
        const base = (baseInput?.value || '').trim();
        const keyVal = (keyInput?.value || '').trim();
        if (base) { localStorage.setItem('gb.base', base); gbBase = base; }
        if (keyVal && keyVal !== '••••••••') { localStorage.setItem('gb.key', keyVal); gbKey = keyVal; }
        if (keyInput && gbKey) keyInput.value = '••••••••';
        runSearch(true);
    });
    if (clearBtn) clearBtn.addEventListener('click', function(){
        localStorage.removeItem('gb.base'); localStorage.removeItem('gb.key');
        gbBase = ''; gbKey = '';
        if (baseInput) baseInput.value = '';
        if (keyInput) keyInput.value = '';
        grid.innerHTML = '';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    });
    if (searchBtn) searchBtn.addEventListener('click', function(){ runSearch(true); });
    if (queryInput) {
        let t; queryInput.addEventListener('input', function(){ clearTimeout(t); t=setTimeout(()=>runSearch(true), 400); });
        queryInput.addEventListener('keypress', function(e){ if (e.key === 'Enter') { e.preventDefault(); runSearch(true); } });
        const savedQ = localStorage.getItem('gb.query'); if (savedQ) queryInput.value = savedQ;
    }
    if (genreSelect) { const sv = localStorage.getItem('gb.genre'); if (sv) genreSelect.value = sv; }
    if (limitInput) { const sl = localStorage.getItem('gb.limit'); if (sl) limitInput.value = sl; }
    const sortSel = document.getElementById('gb-sort');
    if (sortSel) {
        // basic options to mirror screenshot
        [['computed_rating','DESC','Rating'],['price','ASC','Price'],['release_date','DESC','Release Date']].forEach(([k,d,label])=>{
            const opt = document.createElement('option'); opt.value = k+':'+d; opt.textContent = label; sortSel.appendChild(opt);
        });
        sortSel.addEventListener('change', ()=>runSearch(true));
    }
    // Details/modal and card actions
    grid.addEventListener('click', function(e){
        const btn = e.target.closest('.gb-details');
        if (btn) {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const card = btn.closest('.gb-card');
            const title = card.querySelector('.gb-title').textContent;
            const img = card.querySelector('img.gb-img')?.getAttribute('src') || '';
            const modalEl = document.getElementById('gbDetailsModal');
            if (!modalEl) return;
            document.getElementById('gbDetailsTitle').textContent = title;
            document.getElementById('gbDetailsDesc').textContent = '';
            const slides = document.getElementById('gbDetailsSlides');
            slides.innerHTML = '<div class="carousel-item active"><img src="'+img+'" class="d-block w-100" alt="'+title+'"></div>';
            document.getElementById('gbDetailsLink').setAttribute('href', '#');
            const modal = new bootstrap.Modal(modalEl); modal.show();
            return;
        }
        const wish = e.target.closest('.gb-action-wishlist');
        if (wish) { wish.classList.toggle('active'); return; }
        const adultBtn = e.target.closest('.gb-adult-enable');
        if (adultBtn) { const wrap = adultBtn.closest('.gb-adult'); if (wrap) wrap.remove(); return; }
    });
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', async function(){ page += 1; await runSearch(false); });
    if (gbBase && gbKey) { runSearch(true); }
})();

// Build suggestions source from list items
function getAllItems() {
    return $listItems.map(function () {
        return $(this).text().trim();
    }).get();
}

let activeIndex = -1; // keyboard selection

function updateList() {
    const query = ($input.val() || '').toString().toLowerCase();
    let visible = 0;
    $listItems.each(function () {
        const text = $(this).text().toLowerCase();
        const match = text.indexOf(query) !== -1;
        $(this).toggle(match);
        if (match) visible++;
    });
    $count.text(visible);
    updateSuggestions();
}

function updateSuggestions() {
    const query = ($input.val() || '').toString().trim().toLowerCase();
    $suggestions.empty();
    activeIndex = -1;
    if (!query) {
        return;
    }

    const items = getAllItems();
    const matches = items.filter(txt => txt.toLowerCase().includes(query)).slice(0, 8);
    if (matches.length === 0) {
        return;
    }

    matches.forEach((txt, i) => {
        const $li = $('<li class="list-group-item bg-dark text-light border-secondary" role="option"></li>');
        const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
        $li.html(txt.replace(re, '<span class="text-warning">$1<\/span>'));
        $li.on('mousedown', function (e) {
            e.preventDefault();
            selectSuggestion(txt);
        });
        $suggestions.append($li);
    });
}

function selectSuggestion(value) {
    $input.val(value);
    $suggestions.empty();
    updateList();
}

if ($input.length && $listItems.length) {
    // Initialize count and bind events
    updateList();
    $input.on('keyup input', updateList);
    $clear.on('click', function () {
        $input.val('');
        updateList();
        $input.trigger('focus');
    });

// GameBrain block handled by standalone initializer above

// Keyboard navigation for suggestions
$input.on('keydown', function (e) {
    const items = $suggestions.children('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        items.removeClass('active');
        $(items[activeIndex]).addClass('active');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items.removeClass('active');
        $(items[activeIndex]).addClass('active');
    } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < items.length) {
            e.preventDefault();
            const text = $(items[activeIndex]).text();
            selectSuggestion(text);
        }
    } else if (e.key === 'Escape') {
        $suggestions.empty();
    }
});
}
// Search Highlight Feature
(function () {
    const $hSearch = $('#highlight-search');
    const $hClear = $('#clear-highlight');
    const $content = $('#article-content');

    if (!$hSearch.length || !$content.length) return;

    let originalHTML = $content.html();

    function highlight(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            $content.html(originalHTML);
            return;
        }
        const term = searchTerm.trim();
        let modified = originalHTML;
        const regex = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        modified = modified.replace(regex, '<mark class="highlight-match bg-warning text-dark">$1</mark>');
        $content.html(modified);
    }

    $hSearch.on('input keyup', function () {
        highlight($(this).val());
    });

    $hClear.on('click', function () {
        $hSearch.val('');
        $content.html(originalHTML);
        $hSearch.focus();
    });
})();

});

document.addEventListener('DOMContentLoaded', function () {

    // Form Validation
    const registrationForm = document.getElementById('assignment-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (e) {
            let valid = true;

            const email = document.getElementById('assignment-email');
            const emailError = document.getElementById('assignment-email-error');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value) {
                emailError.textContent = 'Email is required.';
                valid = false;
            } else if (!emailPattern.test(email.value)) {
                emailError.textContent = 'Enter a valid email address.';
                valid = false;
            } else {
                emailError.textContent = '';
            }

            const password = document.getElementById('assignment-password');
            const passwordError = document.getElementById('assignment-password-error');
            if (!password.value) {
                passwordError.textContent = 'Password is required.';
                valid = false;
            } else if (password.value.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters.';
                valid = false;
            } else {
                passwordError.textContent = '';
            }

            const confirmPassword = document.getElementById('assignment-confirm-password');
            const confirmPasswordError = document.getElementById('assignment-confirm-password-error');
            if (!confirmPassword.value) {
                confirmPasswordError.textContent = 'Please confirm your password.';
                valid = false;
            } else if (password.value !== confirmPassword.value) {
                confirmPasswordError.textContent = 'Passwords do not match.';
                valid = false;
            } else {
                confirmPasswordError.textContent = '';
            }

            if (!valid) {
                e.preventDefault();
            } else {
                alert("Successfully registered");
            }
        });
    }

    // Registration UX enhancements: password toggles and strength meter
    (function () {
        const pw = document.getElementById('assignment-password');
        const cpw = document.getElementById('assignment-confirm-password');
        const togglePw = document.getElementById('toggle-password');
        const toggleCpw = document.getElementById('toggle-confirm-password');
        const bar = document.getElementById('assignment-password-strength-bar');
        const label = document.getElementById('assignment-password-strength-text');

        function updateStrength(value) {
            if (!bar || !label) return;
            let score = 0;
            if (!value) score = 0;
            else {
                const lengthScore = Math.min(6, Math.max(0, value.length - 5)); // 0..6
                const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].reduce((s, re) => s + (re.test(value) ? 1 : 0), 0); // 0..4
                score = Math.min(10, lengthScore + variety * 2); // 0..10
            }
            const pct = (score / 10) * 100;
            bar.style.width = pct + '%';
            bar.classList.remove('bg-danger', 'bg-warning', 'bg-success');
            let text = 'Weak';
            if (pct >= 70) { bar.classList.add('bg-success'); text = 'Strong'; }
            else if (pct >= 40) { bar.classList.add('bg-warning'); text = 'Medium'; }
            else { bar.classList.add('bg-danger'); text = 'Weak'; }
            label.textContent = `Password strength: ${text}`;
        }

        if (pw) {
            pw.addEventListener('input', function () { updateStrength(pw.value); });
            // initialize on load
            updateStrength(pw.value || '');
        }

        function toggleVisibility(input, btn) {
            if (!input || !btn) return;
            btn.addEventListener('click', function () {
                const isText = input.type === 'text';
                input.type = isText ? 'password' : 'text';
                btn.textContent = isText ? 'Show' : 'Hide';
            });
        }

        toggleVisibility(pw, togglePw);
        toggleVisibility(cpw, toggleCpw);
    })();

    // Accordion
    const questions = document.querySelectorAll('.assignment-accordion-question');
    questions.forEach(q => {
        q.addEventListener('click', function () {
            const answer = this.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                answer.style.padding = '0 1em';
            } else {
                document.querySelectorAll('.assignment-accordion-answer').forEach(a => {
                    a.style.maxHeight = null;
                    a.style.padding = '0 1em';
                });
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.padding = '1em';
            }
        });
    });
    document.querySelectorAll('.assignment-accordion-answer').forEach(a => {
        a.style.maxHeight = null;
        a.style.overflow = 'hidden';
        a.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
        a.style.padding = '0 1em';
    });

    // Popup
    const openPopupBtn = document.getElementById('assignment-open-popup-btn');
    const popupForm = document.getElementById('assignment-popup-form');
    const closePopupBtn = document.getElementById('assignment-close-popup-btn');
    if (openPopupBtn && popupForm && closePopupBtn) {
        openPopupBtn.addEventListener('click', function () {
            popupForm.style.display = 'flex';
        });
        closePopupBtn.addEventListener('click', function () {
            popupForm.style.display = 'none';
        });
        popupForm.addEventListener('click', function (e) {
            if (e.target === popupForm) {
                popupForm.style.display = 'none';
            }
        });
    }

    // Background Color
    const changeBgBtn = document.getElementById('assignment-change-bg-btn');
    const colors = ['#f8b400', '#6a89cc', '#38ada9', '#e55039', '#4a69bd', '#60a3bc', '#78e08f'];
    let colorIndex = 0;
    if (changeBgBtn) {
        changeBgBtn.addEventListener('click', function () {
            document.body.style.backgroundColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        });
    }

    // Date and Time
    function updateDateTime() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        const display = document.getElementById('assignment-date-time-display');
        if (display) display.textContent = now.toLocaleString('ru-Kz', options);
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Enhance date-time updater to support navbar
    (function () {
        function updateGlobalDateTime() {
            var now = new Date();
            var options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            var navEl = document.getElementById('navbar-date-time');
            if (navEl) navEl.textContent = now.toLocaleString('en-US', options);
        }

        updateGlobalDateTime();
        setInterval(updateGlobalDateTime, 1000);
    })();

    // Categories: search highlights on cards
    $(document).ready(function () {
        var $catSearch = $('#category-search-input');
        if ($catSearch.length) {
            $catSearch.on('input keyup', function () {
                var q = ($(this).val() || '').toString().trim().toLowerCase();
                var $cards = $('.game-bootstrap-card');
                if (!q) {
                    $cards.removeClass('search-highlight dimmed');
                    return;
                }
                $cards.each(function () {
                    var $c = $(this);
                    var title = $c.find('.card-title').text().toLowerCase();
                    var text = $c.find('.card-text').text().toLowerCase();
                    var match = title.includes(q) || text.includes(q);
                    $c.toggleClass('search-highlight', match);
                    $c.toggleClass('dimmed', !match);
                });
            });
        }
    });

    // --- Всё остальное остаётся без изменений ---
    // (остальные функции: звёздочки, темы, галерея, фильтры, формы, язык и т.д.)

});


// DOM Manipulation Features

// Star Rating System
const starContainers = document.querySelectorAll('.stars');
starContainers.forEach(container => {
    const stars = container.querySelectorAll('.star');
    const ratingText = container.parentElement.querySelector('.rating-text');

    stars.forEach((star, index) => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.dataset.rating);

            // Update visual state
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });

            // Update rating text
            const gameName = container.dataset.game;
            ratingText.textContent = `Rated ${rating} star${rating > 1 ? 's' : ''} for ${gameName}`;

            // Store rating (could be sent to server)
            console.log(`${gameName} rated ${rating} stars`);
        });

        // Hover effects
        star.addEventListener('mouseenter', function () {
            const rating = parseInt(this.dataset.rating);
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.style.color = '#ffd700';
                } else {
                    s.style.color = '#666';
                }
            });
        });

        star.addEventListener('mouseleave', function () {
            stars.forEach(s => {
                if (!s.classList.contains('active')) {
                    s.style.color = '#666';
                }
            });
        });
    });
});

// Theme Toggle Functionality (default: dark/night, persists via localStorage + cookie)
const themeToggleBtn = document.getElementById('theme-toggle-btn');

function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function getThemeFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('theme');
        if (q === 'day' || q === 'night') return q;
        const hash = (window.location.hash || '').replace('#', '');
        if (hash === 'day' || hash === 'night') return hash;
    } catch (_) {}
    return null;
}

const savedThemeLS = localStorage.getItem('theme'); // 'night' | 'day'
const savedThemeCookie = getCookie('theme');
const savedThemeUrl = getThemeFromUrl();
let isNightTheme = (savedThemeUrl || savedThemeLS || savedThemeCookie)
    ? (savedThemeUrl || savedThemeLS || savedThemeCookie) === 'night'
    : true;

function applyTheme() {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    if (isNightTheme) {
        htmlEl.classList.add('night-theme');
        htmlEl.classList.remove('day-theme');
        bodyEl.classList.add('night-theme');
        bodyEl.classList.remove('day-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = 'Switch to Light Mode';
    } else {
        htmlEl.classList.remove('night-theme');
        htmlEl.classList.add('day-theme');
        bodyEl.classList.remove('night-theme');
        bodyEl.classList.add('day-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = 'Switch to Dark Mode';
    }
    const themeStr = isNightTheme ? 'night' : 'day';
    localStorage.setItem('theme', themeStr);
    setCookie('theme', themeStr);
    // Persist in URL for file:// navigation between standalone pages
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('theme', themeStr);
        window.history.replaceState({}, '', url.toString());
    } catch (_) {}

    // Propagate to navbar internal links
    document.querySelectorAll('.navbar a.nav-link[href$=".html"]').forEach(a => {
        try {
            const linkUrl = new URL(a.getAttribute('href'), window.location.href);
            linkUrl.searchParams.set('theme', themeStr);
            a.setAttribute('href', linkUrl.toString());
        } catch (_) {}
    });
}

applyTheme();

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
        isNightTheme = !isNightTheme;
        applyTheme();
    });
}

// Read More Functionality
const readMoreBtn = document.getElementById('read-more-btn');
const hiddenContent = document.querySelector('.hidden-content');
let isExpanded = false;

if (readMoreBtn && hiddenContent) {
    readMoreBtn.addEventListener('click', function () {
        isExpanded = !isExpanded;

        if (isExpanded) {
            hiddenContent.classList.remove('is-hidden');
            hiddenContent.classList.add('show');
            this.textContent = 'Read Less';
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-outline-secondary');
        } else {
            hiddenContent.classList.add('is-hidden');
            hiddenContent.classList.remove('show');
            this.textContent = 'Read More';
            this.classList.remove('btn-outline-secondary');
            this.classList.add('btn-outline-primary');
        }
    });
}

// Image Gallery Functionality
const mainImage = document.getElementById('main-gallery-image');
const imageTitle = document.getElementById('image-title');
const imageDescription = document.getElementById('image-description');
const thumbnails = document.querySelectorAll('.thumbnail');

if (mainImage && imageTitle && imageDescription && thumbnails.length > 0) {
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));

            // Add active class to clicked thumbnail
            this.classList.add('active');

            // Update main image
            const newSrc = this.dataset.src;
            const newTitle = this.dataset.title;
            const newDesc = this.dataset.desc;

            // Smooth transition effect
            mainImage.style.opacity = '0.5';

            setTimeout(() => {
                mainImage.src = newSrc;
                mainImage.alt = newTitle + ' - Main Gallery Image';
                imageTitle.textContent = newTitle;
                imageDescription.textContent = newDesc;
                mainImage.style.opacity = '1';
            }, 150);
        });
    });

    // Set first thumbnail as active by default
    if (thumbnails.length > 0) {
        thumbnails[0].classList.add('active');
    }
}

// Dynamic Greeting Functionality
const nameInput = document.getElementById('name-input');
const greetingBtn = document.getElementById('greeting-btn');
const greetingDisplay = document.getElementById('greeting-display');

if (nameInput && greetingBtn && greetingDisplay) {
    greetingBtn.addEventListener('click', function () {
        const name = nameInput.value.trim();

        if (name) {
            greetingDisplay.innerHTML = `
                    <h4>Welcome to GoldMine, ${name}!</h4>
                    <p class="text-muted">Ready to discover amazing games?</p>
                `;
            greetingDisplay.style.background = 'rgba(212,175,55,0.2)';
            greetingDisplay.style.borderColor = '#d4af37';

            // Clear input
            nameInput.value = '';
        } else {
            greetingDisplay.innerHTML = `
                    <h4>Please enter your name first!</h4>
                    <p class="text-muted">We'd love to personalize your experience.</p>
                `;
            greetingDisplay.style.background = 'rgba(220,53,69,0.1)';
            greetingDisplay.style.borderColor = '#dc3545';
        }
    });

    // Allow Enter key to trigger greeting
    nameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            greetingBtn.click();
        }
    });
}

// Random Content Fetcher
const randomContentBtn = document.getElementById('random-content-btn');
const randomContentDisplay = document.getElementById('random-content-display');

const gamingFacts = [
    "The first video game, 'Pong', was created in 1972 by Atari founder Nolan Bushnell.",
    "Minecraft has sold over 300 million copies worldwide, making it the best-selling video game of all time.",
    "The gaming industry is worth over $180 billion globally, surpassing both the movie and music industries combined.",
    "The average age of a gamer is 35 years old, and 45% of gamers are women.",
    "The first video game console, the Magnavox Odyssey, was released in 1972.",
    "Tetris was created by Russian programmer Alexey Pajitnov in 1984 while working at the Soviet Academy of Sciences.",
    "The term 'NPC' (Non-Player Character) was first used in tabletop role-playing games before video games.",
    "The first video game tournament was held in 1972 at Stanford University for the game 'Spacewar!'",
    "Pac-Man was originally called 'Puck-Man' but was changed to avoid vandalism of the arcade cabinets.",
    "The gaming industry employs over 2.5 million people worldwide across development, publishing, and related fields."
];

if (randomContentBtn && randomContentDisplay) {
    randomContentBtn.addEventListener('click', function () {
        // Add loading effect
        this.textContent = 'Loading...';
        this.disabled = true;

        // Simulate loading delay for better UX
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * gamingFacts.length);
            const randomFact = gamingFacts[randomIndex];

            randomContentDisplay.innerHTML = `
                    <div class="fact-content">
                        <h5>🎮 Gaming Fact #${randomIndex + 1}</h5>
                        <p>${randomFact}</p>
                    </div>
                `;

            // Reset button
            this.textContent = 'Get Random Fact';
            this.disabled = false;
        }, 800);
    });
}

// Additional DOM Manipulation Examples

// Dynamic content updates based on user interaction
const gameCards = document.querySelectorAll('.game-bootstrap-card');
gameCards.forEach(card => {
    const playBtn = card.querySelector('.btn-primary');
    const wishlistBtn = card.querySelector('.btn-outline-secondary');

    if (playBtn) {
        playBtn.addEventListener('click', function () {
            const gameTitle = card.querySelector('.card-title').textContent;

            // Update button text and style
            this.textContent = 'Playing...';
            this.classList.remove('btn-primary');
            this.classList.add('btn-success');
            this.disabled = true;

            // Reset after 3 seconds
            setTimeout(() => {
                this.textContent = 'Play Now';
                this.classList.remove('btn-success');
                this.classList.add('btn-primary');
                this.disabled = false;
            }, 3000);

            console.log(`Started playing: ${gameTitle}`);
        });
    }

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function () {
            const gameTitle = card.querySelector('.card-title').textContent;

            if (this.textContent === 'Add to Wishlist') {
                this.textContent = 'Added to Wishlist';
                this.classList.remove('btn-outline-secondary');
                this.classList.add('btn-success');
            } else {
                this.textContent = 'Add to Wishlist';
                this.classList.remove('btn-success');
                this.classList.add('btn-outline-secondary');
            }

            console.log(`Wishlist toggled for: ${gameTitle}`);
        });
    }
});

// Dynamic style changes on scroll
let lastScrollTop = 0;
window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const navbar = document.querySelector('.navbar');

    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
});

// Add smooth transitions to navbar
const navbar = document.querySelector('.navbar');
if (navbar) {
    navbar.style.transition = 'transform 0.3s ease-in-out';
}

// Scroll Progress Bar Logic (horizontal top)
const progressBar = document.getElementById('scroll-progress-bar');
const progressGlow = document.getElementById('scroll-progress-glow');
const progressStripes = document.getElementById('scroll-progress-stripes');

function updateScrollProgress() {
    if (!progressBar) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
    const winHeight = window.innerHeight || document.documentElement.clientHeight;
    const totalScrollable = Math.max(docHeight - winHeight, 1);
    const progress = Math.min(100, Math.max(0, (scrollTop / totalScrollable) * 100));
    const width = progress + '%';
    progressBar.style.width = width;
    if (progressGlow) progressGlow.style.width = width;
    if (progressStripes) progressStripes.style.width = width;
}

updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, {passive: true});
window.addEventListener('resize', updateScrollProgress);

// Animated Number Counters (IntersectionObserver)
const counters = document.querySelectorAll('.counter[data-target]');
const hasCounted = new WeakSet();

function animateCounter(el) {
    const target = Number(el.getAttribute('data-target')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const durationMs = 1500; // total duration
    const startTime = performance.now();
    const startVal = 0;

    function format(val) {
        if (target >= 1000) return Math.floor(val).toLocaleString() + suffix;
        return Math.floor(val) + suffix;
    }

    function step(now) {
        const t = Math.min(1, (now - startTime) / durationMs);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        const value = startVal + (target - startVal) * eased;
        el.textContent = format(value);
        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

if (counters.length) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted.has(entry.target)) {
                hasCounted.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, {threshold: 0.3});
    counters.forEach(el => io.observe(el));
}

// Event Handling Features

// Current Time Display Button
const timeDisplayBtn = document.getElementById('time-display-btn');
const timeDisplayArea = document.getElementById('time-display-area');

if (timeDisplayBtn && timeDisplayArea) {
    timeDisplayBtn.addEventListener('click', function () {
        const currentTime = new Date().toLocaleTimeString();
        timeDisplayArea.innerHTML = `
                <p class="time-content">Current Time: ${currentTime}</p>
            `;
    });
}

// Keyboard Navigation
const keyboardNavMenu = document.querySelector('.keyboard-nav-menu');
const navItems = document.querySelectorAll('.nav-item');
let currentNavIndex = 0;

if (keyboardNavMenu && navItems.length > 0) {
    // Set initial focus
    navItems[0].classList.add('active');

    keyboardNavMenu.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                currentNavIndex = (currentNavIndex + 1) % navItems.length;
                updateNavFocus();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                currentNavIndex = (currentNavIndex - 1 + navItems.length) % navItems.length;
                updateNavFocus();
                break;
            case 'Enter':
                e.preventDefault();
                const selectedItem = navItems[currentNavIndex];
                console.log(`Selected: ${selectedItem.textContent}`);
                selectedItem.style.background = '#28a745';
                setTimeout(() => {
                    selectedItem.style.background = '';
                }, 1000);
                break;
        }
    });

    function updateNavFocus() {
        navItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentNavIndex) {
                item.classList.add('active');
                item.focus();
            }
        });
    }
}

// Loading helpers for submit buttons
function startButtonLoading(button, loadingText = 'Please wait…') {
    if (!button) return;
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + loadingText;
    button.disabled = true;
}

function stopButtonLoading(button) {
    if (!button) return;
    button.innerHTML = button.dataset.originalHtml || 'Submit';
    button.disabled = false;
}

// Contact Form with Async Submission
const contactForm = document.getElementById('contact-form') || document.querySelector('.form_section form, form.needs-validation');
let contactFeedback = document.getElementById('contact-feedback');

if (contactForm) {
    if (!contactFeedback) {
        contactFeedback = document.createElement('div');
        contactFeedback.id = 'contact-feedback';
        contactFeedback.className = 'contact-feedback mt-3';
        contactForm.parentElement.appendChild(contactFeedback);
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitButton = contactForm.querySelector('[type="submit"], button.btn-primary, button.btn');
        startButtonLoading(submitButton);

        // Show loading state
        contactFeedback.className = 'contact-feedback loading';
        contactFeedback.innerHTML = '<p>Sending message...</p>';

        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name') || (document.getElementById('contact-name') ? document.getElementById('contact-name').value : (document.getElementById('name') ? document.getElementById('name').value : '')),
            email: formData.get('email') || (document.getElementById('contact-email') ? document.getElementById('contact-email').value : (document.getElementById('email') ? document.getElementById('email').value : '')),
            message: formData.get('message') || (document.getElementById('contact-message') ? document.getElementById('contact-message').value : (document.getElementById('message') ? document.getElementById('message').value : ''))
        };

        // Simulate async submission
        setTimeout(() => {
            // Simulate success (in real app, this would be a fetch to server)
            contactFeedback.className = 'contact-feedback success';
            contactFeedback.innerHTML = `
                    <p>✅ Message sent successfully!</p>
                    <p>Thank you, ${data.name || 'friend'}! We'll get back to you soon.</p>
                `;

            // Reset form
            contactForm.reset();
            stopButtonLoading(submitButton);
        }, 2000);
    });
}

// Multi-Step Form
const multiStepForm = document.getElementById('multi-step-form');
const formSteps = document.querySelectorAll('.form-step');
const prevBtn = document.getElementById('prev-step-btn');
const nextBtn = document.getElementById('next-step-btn');
const submitBtn = document.getElementById('submit-form-btn');
const formStepProgressBar = document.querySelector('.progress-bar');
const progressText = document.querySelector('.form-progress small');

let currentStep = 1;
const totalSteps = formSteps.length;

if (multiStepForm && formSteps.length > 0) {
    // Next step functionality
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            if (validateCurrentStep()) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    updateFormStep();
                }
            }
        });
    }

    // Previous step functionality
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            if (currentStep > 1) {
                currentStep--;
                updateFormStep();
            }
        });
    }

    // Form submission
    if (submitBtn) {
        submitBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (validateCurrentStep()) {
                // Simulate form submission
                startButtonLoading(submitBtn, 'Please wait…');

                setTimeout(() => {
                    alert('Registration completed successfully!');
                    multiStepForm.reset();
                    currentStep = 1;
                    updateFormStep();
                    stopButtonLoading(submitBtn);
                }, 1500);
            }
        });
    }

    function updateFormStep() {
        // Hide all steps
        formSteps.forEach(step => step.classList.remove('active'));

        // Show current step
        formSteps[currentStep - 1].classList.add('active');

        // Update navigation buttons
        prevBtn.disabled = currentStep === 1;
        if (currentStep < totalSteps) {
            nextBtn.classList.remove('d-none');
            submitBtn.classList.add('d-none');
        } else {
            nextBtn.classList.add('d-none');
            submitBtn.classList.remove('d-none');
        }

        // Update progress
        const progress = (currentStep / totalSteps) * 100;
        if (formStepProgressBar) formStepProgressBar.style.width = `${progress}%`;
        progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
    }

    function validateCurrentStep() {
        const currentStepElement = formSteps[currentStep - 1];
        const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required]');

        for (let input of requiredInputs) {
            if (!input.value.trim()) {
                input.focus();
                alert(`Please fill in the ${input.previousElementSibling.textContent.replace(':', '')} field.`);
                return false;
            }
        }
        return true;
    }

    // Initialize form
    updateFormStep();
}

// Product Filtering System with Switch Statements
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const filteredGamesContainer = document.getElementById('filtered-games');

// Sample game data
const gamesData = [
    {name: 'Minecraft', category: 'action', price: 29.99, priceRange: '20-50'},
    {name: 'Hollow Knight', category: 'action', price: 15.99, priceRange: 'under-20'},
    {name: 'Dark Souls 3', category: 'rpg', price: 59.99, priceRange: 'over-50'},
    {name: 'Hearts of Iron 4', category: 'strategy', price: 39.99, priceRange: '20-50'},
    {name: 'FIFA 24', category: 'sports', price: 69.99, priceRange: 'over-50'},
    {name: 'Among Us', category: 'action', price: 0, priceRange: 'free'},
    {name: 'Civilization VI', category: 'strategy', price: 49.99, priceRange: '20-50'},
    {name: 'The Witcher 3', category: 'rpg', price: 39.99, priceRange: '20-50'}
];

function renderGames(games) {
    if (filteredGamesContainer) {
        filteredGamesContainer.innerHTML = games.map(game => `
                <div class="game-item">
                    <h6>${game.name}</h6>
                    <div class="game-category">Category: ${game.category.toUpperCase()}</div>
                    <div class="game-price">$${game.price === 0 ? 'Free' : game.price}</div>
                </div>
            `).join('');
    }
}

function filterGames() {
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedPrice = priceFilter ? priceFilter.value : 'all';

    let filteredGames = gamesData;

    // Filter by category using switch statement
    switch (selectedCategory) {
        case 'action':
            filteredGames = filteredGames.filter(game => game.category === 'action');
            break;
        case 'rpg':
            filteredGames = filteredGames.filter(game => game.category === 'rpg');
            break;
        case 'strategy':
            filteredGames = filteredGames.filter(game => game.category === 'strategy');
            break;
        case 'sports':
            filteredGames = filteredGames.filter(game => game.category === 'sports');
            break;
        case 'all':
        default:
            // No filtering by category
            break;
    }

    // Filter by price using switch statement
    switch (selectedPrice) {
        case 'free':
            filteredGames = filteredGames.filter(game => game.price === 0);
            break;
        case 'under-20':
            filteredGames = filteredGames.filter(game => game.price > 0 && game.price < 20);
            break;
        case '20-50':
            filteredGames = filteredGames.filter(game => game.price >= 20 && game.price <= 50);
            break;
        case 'over-50':
            filteredGames = filteredGames.filter(game => game.price > 50);
            break;
        case 'all':
        default:
            // No filtering by price
            break;
    }

    renderGames(filteredGames);
}

// Add event listeners for filtering
if (categoryFilter) {
    categoryFilter.addEventListener('change', filterGames);
}
if (priceFilter) {
    priceFilter.addEventListener('change', filterGames);
}

// Initialize games display
renderGames(gamesData);

// Language Selector with Switch Statements
const languageButtons = document.querySelectorAll('.language-btn');
const welcomeText = document.getElementById('welcome-text');
const descriptionText = document.getElementById('description-text');
const featuresText = document.getElementById('features-text');

const translations = {
    en: {
        welcome: 'Welcome to GoldMine Gaming Platform!',
        description: 'Discover amazing games and connect with fellow gamers.',
        features: 'Features: Game Discovery, Expert Reviews, Community Hub'
    },
    ru: {
        welcome: 'Добро пожаловать на игровую платформу GoldMine!',
        description: 'Откройте для себя удивительные игры и общайтесь с единомышленниками.',
        features: 'Возможности: Поиск игр, Экспертные обзоры, Сообщество'
    },
    kz: {
        welcome: 'GoldMine ойын платформасына қош келдіңіз!',
        description: 'Керемет ойындарды ашып, ойыншылармен байланысыңыз.',
        features: 'Мүмкіндіктер: Ойын іздеу, Эксперттік шолулар, Қауымдастық'
    }
};

function changeLanguage(lang) {
    // Update button states
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    // Update content using switch statement
    switch (lang) {
        case 'en':
            if (welcomeText) welcomeText.textContent = translations.en.welcome;
            if (descriptionText) descriptionText.textContent = translations.en.description;
            if (featuresText) featuresText.textContent = translations.en.features;
            break;
        case 'ru':
            if (welcomeText) welcomeText.textContent = translations.ru.welcome;
            if (descriptionText) descriptionText.textContent = translations.ru.description;
            if (featuresText) featuresText.textContent = translations.ru.features;
            break;
        case 'kz':
            if (welcomeText) welcomeText.textContent = translations.kz.welcome;
            if (descriptionText) descriptionText.textContent = translations.kz.description;
            if (featuresText) featuresText.textContent = translations.kz.features;
            break;
        default:
            console.log('Unsupported language');
    }

    // Store language preference
    localStorage.setItem('selectedLanguage', lang);
}

// Add event listeners for language buttons
languageButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        changeLanguage(this.dataset.lang);
    });
});

// Load saved language preference
const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
changeLanguage(savedLanguage);

// Time-based Greeting with Switch Statement
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    let greeting;

    switch (true) {
        case hour >= 5 && hour < 12:
            greeting = 'Good Morning';
            break;
        case hour >= 12 && hour < 17:
            greeting = 'Good Afternoon';
            break;
        case hour >= 17 && hour < 21:
            greeting = 'Good Evening';
            break;
        default:
            greeting = 'Good Night';
    }

    return greeting;
}

// Update greeting periodically
setInterval(() => {
    const greeting = getTimeBasedGreeting();
    const greetingElements = document.querySelectorAll('.time-based-greeting');
    greetingElements.forEach(element => {
        element.textContent = greeting;
    });
}, 60000); // Update every minute

// Additional Event Handling Examples

// Form Reset Button
const resetButtons = document.querySelectorAll('.reset-form-btn');
resetButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const form = this.closest('form');
        if (form) {
            document.querySelectorAll('input').forEach(input => input.value = '');
            document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
            document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
            console.log('Form reset successfully');
        }
    });
});

// Dynamic Content Loading (Simulated)
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
        this.textContent = 'Loading...';
        this.disabled = true;

        // Simulate content loading
        setTimeout(() => {
            const newContent = document.createElement('div');
            newContent.innerHTML = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">New Game ${Date.now()}</h5>
                            <p class="card-text">This is dynamically loaded content!</p>
                        </div>
                    </div>
                `;

            const container = document.getElementById('dynamic-content-container');
            if (container) {
                container.appendChild(newContent);
            }

            this.textContent = 'Load More';
            this.disabled = false;
        }, 1000);
    });
}

// Advanced JavaScript Features

// JavaScript Objects and Methods - Game Library Management
class GameLibrary {
    constructor() {
        this.games = [];
        this.nextId = 1;
    }

    addGame(name, genre, rating) {
        const game = {
            id: this.nextId++,
            name: name,
            genre: genre,
            rating: rating,
            dateAdded: new Date().toLocaleDateString()
        };
        this.games.push(game);
        return game;
    }

    getAllGames() {
        return this.games;
    }

    sortByRating() {
        return this.games.sort((a, b) => b.rating - a.rating);
    }

    getGamesByGenre(genre) {
        return this.games.filter(game => game.genre.toLowerCase() === genre.toLowerCase());
    }

    getAverageRating() {
        if (this.games.length === 0) return 0;
        const total = this.games.reduce((sum, game) => sum + game.rating, 0);
        return (total / this.games.length).toFixed(2);
    }

    getTotalGames() {
        return this.games.length;
    }
}

const gameLibrary = new GameLibrary();

// Initialize with sample games
gameLibrary.addGame("Minecraft", "Sandbox", 9);
gameLibrary.addGame("Hollow Knight", "Metroidvania", 8);
gameLibrary.addGame("Dark Souls 3", "Action RPG", 9);
gameLibrary.addGame("Hearts of Iron 4", "Strategy", 7);

// Game Library Form Handler
const addGameForm = document.getElementById('add-game-form');
const gameLibraryDisplay = document.getElementById('game-library-display');
const sortGamesBtn = document.getElementById('sort-games-btn');

if (addGameForm && gameLibraryDisplay) {
    addGameForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('game-name').value;
        const genre = document.getElementById('game-genre').value;
        const rating = parseInt(document.getElementById('game-rating').value);

        const newGame = gameLibrary.addGame(name, genre, rating);
        displayGames();

        // Clear form
        addGameForm.reset();

        // Show success message
        showNotification(`Game "${name}" added successfully!`, 'success');
    });
}

if (sortGamesBtn) {
    sortGamesBtn.addEventListener('click', function () {
        const sortedGames = gameLibrary.sortByRating();
        displayGames(sortedGames);
        this.textContent = 'Sorted by Rating ✓';
        setTimeout(() => {
            this.textContent = 'Sort by Rating';
        }, 2000);
    });
}

function displayGames(games = null) {
    if (!gameLibraryDisplay) return;

    const gamesToShow = games || gameLibrary.getAllGames();
    gameLibraryDisplay.innerHTML = '';

    if (gamesToShow.length === 0) {
        gameLibraryDisplay.innerHTML = '<p class="text-muted">No games in library</p>';
        return;
    }

    gamesToShow.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-item-display';
        gameElement.innerHTML = `
                <h6>${game.name}</h6>
                <p class="mb-1"><strong>Genre:</strong> ${game.genre}</p>
                <p class="mb-1"><strong>Rating:</strong> <span class="game-rating">${game.rating}/10</span></p>
                <small class="text-muted">Added: ${game.dateAdded}</small>
            `;
        gameLibraryDisplay.appendChild(gameElement);
    });
}

// Initialize display
displayGames();

// Arrays and Loops Demo
const achievementsData = [
    "First Victory", "Speed Runner", "Collector", "Explorer", "Master Builder",
    "Boss Slayer", "Treasure Hunter", "Puzzle Solver", "Team Player", "Legend"
];

const playerStats = [
    {label: "Games Played", value: 0},
    {label: "Hours Played", value: 0},
    {label: "Achievements", value: 0},
    {label: "High Score", value: 0}
];

const generateAchievementsBtn = document.getElementById('generate-achievements-btn');
const achievementsList = document.getElementById('achievements-list');
const calculateStatsBtn = document.getElementById('calculate-stats-btn');
const statsDisplay = document.getElementById('stats-display');

if (generateAchievementsBtn && achievementsList) {
    generateAchievementsBtn.addEventListener('click', function () {
        achievementsList.innerHTML = '';

        // Use for loop to generate random achievements
        const numAchievements = Math.floor(Math.random() * 5) + 3;
        const usedAchievements = new Set();

        for (let i = 0; i < numAchievements; i++) {
            let randomAchievement;
            do {
                randomAchievement = achievementsData[Math.floor(Math.random() * achievementsData.length)];
            } while (usedAchievements.has(randomAchievement));

            usedAchievements.add(randomAchievement);

            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-item';
            achievementElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>🏆 ${randomAchievement}</span>
                        <small class="text-muted">${new Date().toLocaleDateString()}</small>
                    </div>
                `;
            achievementsList.appendChild(achievementElement);
        }
    });
}

if (calculateStatsBtn && statsDisplay) {
    calculateStatsBtn.addEventListener('click', function () {
        statsDisplay.innerHTML = '';

        // Use while loop to calculate random stats
        let i = 0;
        while (i < playerStats.length) {
            const stat = playerStats[i];
            stat.value = Math.floor(Math.random() * 1000) + 100;

            const statElement = document.createElement('div');
            statElement.className = 'stat-item-display';
            statElement.innerHTML = `
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                `;
            statsDisplay.appendChild(statElement);
            i++;
        }
    });
}

// Higher-Order Functions Demo
const gameCollection = [
    {name: "Minecraft", rating: 9, genre: "Sandbox"},
    {name: "Hollow Knight", rating: 8, genre: "Metroidvania"},
    {name: "Dark Souls 3", rating: 9, genre: "Action RPG"},
    {name: "Hearts of Iron 4", rating: 7, genre: "Strategy"},
    {name: "Among Us", rating: 6, genre: "Social"},
    {name: "The Witcher 3", rating: 10, genre: "RPG"}
];

const gameCollectionDisplay = document.getElementById('game-collection');
const filterHighRatedBtn = document.getElementById('filter-high-rated-btn');
const filteredGamesDisplay = document.getElementById('filtered-games-display');
const mapGameNamesBtn = document.getElementById('map-game-names-btn');
const mappedNamesDisplay = document.getElementById('mapped-names-display');

// Display initial collection using forEach
function displayGameCollection(games, container) {
    if (!container) return;

    container.innerHTML = '';
    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'collection-game-item';
        gameElement.innerHTML = `
                <div class="game-name">${game.name}</div>
                <div class="game-rating">Rating: ${game.rating}/10</div>
                <small class="text-muted">Genre: ${game.genre}</small>
            `;
        container.appendChild(gameElement);
    });
}

// Initialize collection display
displayGameCollection(gameCollection, gameCollectionDisplay);

if (filterHighRatedBtn && filteredGamesDisplay) {
    filterHighRatedBtn.addEventListener('click', function () {
        // Use filter higher-order function
        const highRatedGames = gameCollection.filter(game => game.rating > 7);
        displayGameCollection(highRatedGames, filteredGamesDisplay);
        this.textContent = `Found ${highRatedGames.length} High Rated Games`;
    });
}

if (mapGameNamesBtn && mappedNamesDisplay) {
    mapGameNamesBtn.addEventListener('click', function () {
        // Use map higher-order function
        const gameNames = gameCollection.map(game => game.name.toUpperCase());

        mappedNamesDisplay.innerHTML = '';
        gameNames.forEach(name => {
            const nameElement = document.createElement('div');
            nameElement.className = 'mapped-name-item';
            nameElement.textContent = name;
            mappedNamesDisplay.appendChild(nameElement);
        });

        this.textContent = `Mapped ${gameNames.length} Names`;
    });
}

// Sound Effects Demo
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.volume = 0.5;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playSuccessSound() {
        this.playTone(523, 0.2); // C5
        setTimeout(() => this.playTone(659, 0.2), 100); // E5
        setTimeout(() => this.playTone(784, 0.3), 200); // G5
    }

    playErrorSound() {
        this.playTone(200, 0.5, 'sawtooth');
    }

    playNotificationSound() {
        this.playTone(800, 0.1);
        setTimeout(() => this.playTone(600, 0.1), 150);
        setTimeout(() => this.playTone(400, 0.1), 300);
    }

    playVictorySound() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 0.3), index * 150);
        });
    }

    setVolume(volume) {
        this.volume = volume / 100;
    }
}

const audioManager = new AudioManager();

// Sound effect buttons
const playSuccessSoundBtn = document.getElementById('play-success-sound');
const playErrorSoundBtn = document.getElementById('play-error-sound');
const playNotificationSoundBtn = document.getElementById('play-notification-sound');
const playVictorySoundBtn = document.getElementById('play-victory-sound');
const testAllSoundsBtn = document.getElementById('test-all-sounds-btn');
const volumeControl = document.getElementById('volume-control');
const volumeDisplay = document.getElementById('volume-display');
const audioStatus = document.getElementById('audio-status');

if (playSuccessSoundBtn) {
    playSuccessSoundBtn.addEventListener('click', function () {
        audioManager.playSuccessSound();
        updateAudioStatus('Success sound played!', 'success');
    });
}

if (playErrorSoundBtn) {
    playErrorSoundBtn.addEventListener('click', function () {
        audioManager.playErrorSound();
        updateAudioStatus('Error sound played!', 'error');
    });
}

if (playNotificationSoundBtn) {
    playNotificationSoundBtn.addEventListener('click', function () {
        audioManager.playNotificationSound();
        updateAudioStatus('Notification sound played!', 'success');
    });
}

if (playVictorySoundBtn) {
    playVictorySoundBtn.addEventListener('click', function () {
        audioManager.playVictorySound();
        updateAudioStatus('Victory sound played!', 'success');
    });
}

if (testAllSoundsBtn) {
    testAllSoundsBtn.addEventListener('click', function () {
        updateAudioStatus('Playing all sounds...', 'success');
        audioManager.playSuccessSound();
        setTimeout(() => audioManager.playNotificationSound(), 1000);
        setTimeout(() => audioManager.playVictorySound(), 2000);
    });
}

if (volumeControl && volumeDisplay) {
    volumeControl.addEventListener('input', function () {
        const volume = this.value;
        volumeDisplay.textContent = volume;
        audioManager.setVolume(volume);
    });
}

function updateAudioStatus(message, type) {
    if (!audioStatus) return;

    audioStatus.innerHTML = `<p class="status-${type}">${message}</p>`;
    setTimeout(() => {
        audioStatus.innerHTML = '<p class="text-muted">Click a sound button to test audio functionality</p>';
    }, 3000);
}

// Global mute toggle with persistence
const muteToggle = document.getElementById('mute-toggle');
const savedMuted = localStorage.getItem('audioMuted') === 'true';
if (muteToggle) {
    muteToggle.checked = savedMuted;
    if (savedMuted && typeof audioManager?.setVolume === 'function') {
        audioManager.setVolume(0);
        if (volumeDisplay) volumeDisplay.textContent = '0';
        if (volumeControl) volumeControl.value = 0;
    }
    muteToggle.addEventListener('change', function () {
        const muted = this.checked;
        localStorage.setItem('audioMuted', String(muted));
        if (muted) {
            if (typeof audioManager?.setVolume === 'function') audioManager.setVolume(0);
            if (volumeDisplay) volumeDisplay.textContent = '0';
            if (volumeControl) volumeControl.value = 0;
        } else {
            if (typeof audioManager?.setVolume === 'function') audioManager.setVolume(volumeControl ? volumeControl.value : 50);
            if (volumeDisplay && volumeControl) volumeDisplay.textContent = volumeControl.value;
        }
    });
}

// Animations Demo
const animationTarget = document.getElementById('animation-target');
const animatedElement = animationTarget ? animationTarget.querySelector('.animated-element') : null;

const fadeInBtn = document.getElementById('fade-in-btn');
const fadeOutBtn = document.getElementById('fade-out-btn');
const slideInBtn = document.getElementById('slide-in-btn');
const bounceBtn = document.getElementById('bounce-btn');
const rotateBtn = document.getElementById('rotate-btn');
const pulseBtn = document.getElementById('pulse-btn');
const resetAnimationsBtn = document.getElementById('reset-animations-btn');

function applyAnimation(animationClass) {
    if (!animatedElement) return;

    // Remove all animation classes
    animatedElement.classList.remove('fade-in', 'fade-out', 'slide-in', 'bounce', 'rotate', 'pulse');

    // Force reflow
    animatedElement.offsetHeight;

    // Add new animation class
    animatedElement.classList.add(animationClass);

    // Remove animation class after animation completes
    setTimeout(() => {
        animatedElement.classList.remove(animationClass);
    }, 1000);
}

if (fadeInBtn) {
    fadeInBtn.addEventListener('click', () => applyAnimation('fade-in'));
}

if (fadeOutBtn) {
    fadeOutBtn.addEventListener('click', () => applyAnimation('fade-out'));
}

if (slideInBtn) {
    slideInBtn.addEventListener('click', () => applyAnimation('slide-in'));
}

if (bounceBtn) {
    bounceBtn.addEventListener('click', () => applyAnimation('bounce'));
}

if (rotateBtn) {
    rotateBtn.addEventListener('click', () => applyAnimation('rotate'));
}

if (pulseBtn) {
    pulseBtn.addEventListener('click', () => applyAnimation('pulse'));
}

if (resetAnimationsBtn) {
    resetAnimationsBtn.addEventListener('click', function () {
        if (animatedElement) {
            animatedElement.classList.remove('fade-in', 'fade-out', 'slide-in', 'bounce', 'rotate', 'pulse');
            animatedElement.style.transform = '';
            animatedElement.style.opacity = '';
        }
    });
}

// Konami code easter egg: up up down down left right left right b a
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const recentKeys = [];
document.addEventListener('keydown', (e) => {
    recentKeys.push(e.key);
    if (recentKeys.length > konamiSequence.length) recentKeys.shift();
    if (konamiSequence.every((k, i) => recentKeys[i]?.toLowerCase() === k.toLowerCase())) {
        // fun: confetti-like animation and victory sound
        try {
            audioManager.playVictorySound();
        } catch (err) {
        }
        triggerConfetti();
        showNotification('Konami code activated! 🎉', 'success');
        recentKeys.length = 0;
    }
});

function triggerConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#d4af37', '#ffd700', '#17a2b8', '#28a745', '#dc3545', '#6c757d'];
    const pieces = 120;
    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement('span');
        piece.style.position = 'absolute';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.top = '-10px';
        piece.style.width = '8px';
        piece.style.height = '14px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        piece.style.opacity = '0.9';
        piece.style.borderRadius = '2px';
        container.appendChild(piece);

        const duration = 3000 + Math.random() * 2000;
        const translateX = (Math.random() - 0.5) * 200;
        piece.animate([
            {transform: `translate(0, 0) rotate(0deg)`, opacity: 1},
            {transform: `translate(${translateX}px, 100vh) rotate(720deg)`, opacity: 0.7}
        ], {duration, easing: 'cubic-bezier(.17,.67,.83,.67)', fill: 'forwards'});
    }
    setTimeout(() => container.remove(), 5500);
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}
;

// Part 3: jQuery Features for Assignment 7
// Toast Notification System
window.showToast = function (message) {
    $('#notification-toast').stop(true).text(message).fadeIn(300).delay(2000).fadeOut(600);
};
$(document).on('click', 'button[data-action="wishlist"]', function () {
    var game = $(this).data('game') || "Game";
    showToast(game + ' added to your wishlist!');
});
// Copy to Clipboard Button
$(document).on('click', '.copy-btn', function () {
    var $btn = $(this);
    var targetEl = $($btn.data('clipboard-target'))[0];
    if (!targetEl) return;
    var copied = targetEl.tagName === 'PRE' ? targetEl.innerText : $(targetEl).text();
    navigator.clipboard.writeText(copied).then(function () {
        $btn.text('✔ Copied!');
        setTimeout(function () {
            $btn.text('Copy');
        }, 1200);
    });
});

// Image Lazy Loading
function lazyLoad() {
    $('.lazy-img').each(function () {
        var $img = $(this);
        if ($img.attr('src') !== $img.data('src') &&
            $img.offset().top < $(window).scrollTop() + $(window).height() + 150) {
            $img.attr('src', $img.data('src'));
        }
    });
}

$(window).on('scroll resize', lazyLoad);
lazyLoad();
