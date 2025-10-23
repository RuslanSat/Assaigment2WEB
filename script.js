// Assignment Demo JavaScript (unique selectors)

document.addEventListener('DOMContentLoaded', function() {
    // Form Validation
    const registrationForm = document.getElementById('assignment-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
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
            }
            if (valid) {
            alert("Succesfully registered");
            }
        }
        );

    // Accordion
    const questions = document.querySelectorAll('.assignment-accordion-question');
    questions.forEach(q => {
        q.addEventListener('click', function() {
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
        openPopupBtn.addEventListener('click', function() {
            popupForm.style.display = 'flex';
        });
        closePopupBtn.addEventListener('click', function() {
            popupForm.style.display = 'none';
        });
        popupForm.addEventListener('click', function(e) {
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
        changeBgBtn.addEventListener('click', function() {
            document.body.style.backgroundColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        });
    }

    // Date and Time
    function updateDateTime() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        const display = document.getElementById('assignment-date-time-display');
        if (display) display.textContent = now.toLocaleString('ru-Kz', options);
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // DOM Manipulation Features
    
    // Star Rating System
    const starContainers = document.querySelectorAll('.stars');
    starContainers.forEach(container => {
        const stars = container.querySelectorAll('.star');
        const ratingText = container.parentElement.querySelector('.rating-text');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
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
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.style.color = '#ffd700';
                    } else {
                        s.style.color = '#666';
                    }
                });
            });
            
            star.addEventListener('mouseleave', function() {
                stars.forEach(s => {
                    if (!s.classList.contains('active')) {
                        s.style.color = '#666';
                    }
                });
            });
        });
    });

    // Theme Toggle Functionality
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    let isNightTheme = false;
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            isNightTheme = !isNightTheme;
            
            if (isNightTheme) {
                document.body.classList.add('night-theme');
                this.textContent = 'Switch to Day Mode';
                this.style.background = 'linear-gradient(to right, #2d2d2d, #1a1a1a)';
            } else {
                document.body.classList.remove('night-theme');
                this.textContent = 'Switch to Night Mode';
                this.style.background = 'linear-gradient(to right, #d4af37, #b8860b)';
            }
        });
    }

    // Read More Functionality
    const readMoreBtn = document.getElementById('read-more-btn');
    const hiddenContent = document.querySelector('.hidden-content');
    let isExpanded = false;
    
    if (readMoreBtn && hiddenContent) {
        readMoreBtn.addEventListener('click', function() {
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                hiddenContent.style.display = 'block';
                hiddenContent.classList.add('show');
                this.textContent = 'Read Less';
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-outline-secondary');
            } else {
                hiddenContent.style.display = 'none';
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
            thumbnail.addEventListener('click', function() {
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
        greetingBtn.addEventListener('click', function() {
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
        nameInput.addEventListener('keypress', function(e) {
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
        randomContentBtn.addEventListener('click', function() {
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
            playBtn.addEventListener('click', function() {
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
            wishlistBtn.addEventListener('click', function() {
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
    window.addEventListener('scroll', function() {
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

    // Event Handling Features
    
    // Current Time Display Button
    const timeDisplayBtn = document.getElementById('time-display-btn');
    const timeDisplayArea = document.getElementById('time-display-area');
    
    if (timeDisplayBtn && timeDisplayArea) {
        timeDisplayBtn.addEventListener('click', function() {
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
        
        keyboardNavMenu.addEventListener('keydown', function(e) {
            switch(e.key) {
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

    // Contact Form with Async Submission
    const contactForm = document.getElementById('contact-form');
    const contactFeedback = document.getElementById('contact-feedback');
    
    if (contactForm && contactFeedback) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            contactFeedback.className = 'contact-feedback loading';
            contactFeedback.innerHTML = '<p>Sending message...</p>';
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name') || document.getElementById('contact-name').value,
                email: formData.get('email') || document.getElementById('contact-email').value,
                message: formData.get('message') || document.getElementById('contact-message').value
            };
            
            // Simulate async submission
            setTimeout(() => {
                // Simulate success (in real app, this would be a fetch to server)
                contactFeedback.className = 'contact-feedback success';
                contactFeedback.innerHTML = `
                    <p>✅ Message sent successfully!</p>
                    <p>Thank you, ${data.name}! We'll get back to you soon.</p>
                `;
                
                // Reset form
                contactForm.reset();
            }, 2000);
        });
    }

    // Multi-Step Form
    const multiStepForm = document.getElementById('multi-step-form');
    const formSteps = document.querySelectorAll('.form-step');
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const submitBtn = document.getElementById('submit-form-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.form-progress small');
    
    let currentStep = 1;
    const totalSteps = formSteps.length;
    
    if (multiStepForm && formSteps.length > 0) {
        // Next step functionality
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
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
            prevBtn.addEventListener('click', function() {
                if (currentStep > 1) {
                    currentStep--;
                    updateFormStep();
                }
            });
        }
        
        // Form submission
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (validateCurrentStep()) {
                    // Simulate form submission
                    submitBtn.textContent = 'Submitting...';
                    submitBtn.disabled = true;
                    
                    setTimeout(() => {
                        alert('Registration completed successfully!');
                        multiStepForm.reset();
                        currentStep = 1;
                        updateFormStep();
                        submitBtn.textContent = 'Complete Registration';
                        submitBtn.disabled = false;
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
            nextBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
            submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
            
            // Update progress
            const progress = (currentStep / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
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
        { name: 'Minecraft', category: 'action', price: 29.99, priceRange: '20-50' },
        { name: 'Hollow Knight', category: 'action', price: 15.99, priceRange: 'under-20' },
        { name: 'Dark Souls 3', category: 'rpg', price: 59.99, priceRange: 'over-50' },
        { name: 'Hearts of Iron 4', category: 'strategy', price: 39.99, priceRange: '20-50' },
        { name: 'FIFA 24', category: 'sports', price: 69.99, priceRange: 'over-50' },
        { name: 'Among Us', category: 'action', price: 0, priceRange: 'free' },
        { name: 'Civilization VI', category: 'strategy', price: 49.99, priceRange: '20-50' },
        { name: 'The Witcher 3', category: 'rpg', price: 39.99, priceRange: '20-50' }
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
        switch(selectedCategory) {
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
        switch(selectedPrice) {
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
        switch(lang) {
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
        btn.addEventListener('click', function() {
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
        
        switch(true) {
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
        btn.addEventListener('click', function() {
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
        loadMoreBtn.addEventListener('click', function() {
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
});
