// JavaScript Assignment Demo

document.addEventListener('DOMContentLoaded', function() {
    // Task 1: Form Validation
    const registrationForm = document.getElementById('registrationForm');
    registrationForm.addEventListener('submit', function(e) {
        let valid = true;
        // Email validation
        const email = document.getElementById('email');
        const emailError = document.getElementById('emailError');
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
        // Password validation
        const password = document.getElementById('password');
        const passwordError = document.getElementById('passwordError');
        if (!password.value) {
            passwordError.textContent = 'Password is required.';
            valid = false;
        } else if (password.value.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters.';
            valid = false;
        } else {
            passwordError.textContent = '';
        }
        // Confirm password validation
        const confirmPassword = document.getElementById('confirmPassword');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
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

    // Task 2: Accordion for FAQs
    const questions = document.querySelectorAll('.accordion-question');
    questions.forEach(q => {
        q.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                answer.style.padding = '0 1em';
            } else {
                document.querySelectorAll('.accordion-answer').forEach(a => {
                    a.style.maxHeight = null;
                    a.style.padding = '0 1em';
                });
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.padding = '1em';
            }
        });
    });
    // Hide all answers by default
    document.querySelectorAll('.accordion-answer').forEach(a => {
        a.style.maxHeight = null;
        a.style.overflow = 'hidden';
        a.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
        a.style.padding = '0 1em';
    });

    // Task 3: Popup Subscription/Contact Form
    const openPopupBtn = document.getElementById('openPopupBtn');
    const popupForm = document.getElementById('popupForm');
    const closePopupBtn = document.getElementById('closePopupBtn');
    openPopupBtn.addEventListener('click', function() {
        popupForm.style.display = 'flex';
    });
    closePopupBtn.addEventListener('click', function() {
        popupForm.style.display = 'none';
    });
    // Close popup when clicking outside the form
    popupForm.addEventListener('click', function(e) {
        if (e.target === popupForm) {
            popupForm.style.display = 'none';
        }
    });

    // Task 4: Change Background Color
    const changeBgBtn = document.getElementById('changeBgBtn');
    const colors = ['#f8b400', '#6a89cc', '#38ada9', '#e55039', '#4a69bd', '#60a3bc', '#78e08f'];
    let colorIndex = 0;
    changeBgBtn.addEventListener('click', function() {
        document.body.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
    });

    // Task 5: Display Current Date and Time
    function updateDateTime() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        document.getElementById('dateTimeDisplay').textContent = now.toLocaleString('en-US', options);
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);
});
