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
        });
    }

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
        if (display) display.textContent = now.toLocaleString('en-US', options);
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);
});
