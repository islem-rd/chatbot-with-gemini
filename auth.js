const themeToggle = document.getElementById('theme-toggle-btn');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const passwordToggles = document.querySelectorAll('.toggle-password');

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const isLightTheme = document.body.classList.toggle('light-theme');
    localStorage.setItem('themeColor', isLightTheme ? 'light' : 'dark');
    themeToggle.textContent = isLightTheme ? 'dark_mode' : 'light_mode';
});

// Apply saved theme
const savedTheme = localStorage.getItem('themeColor');
if (savedTheme) {
    const isLightTheme = savedTheme === 'light';
    document.body.classList.toggle('light-theme', isLightTheme);
    themeToggle.textContent = isLightTheme ? 'dark_mode' : 'light_mode';
}

// Password visibility toggle
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.parentElement.querySelector('input');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        toggle.textContent = type === 'password' ? 'visibility_off' : 'visibility';
    });
});

// Sign-in form submission
if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Client-side validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        // Send request to server
        fetch('signin.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            showNotification('An error occurred. Please try again.', 'error');
            console.error('Error:', error);
        });
    });
}

// Sign-up form submission
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Client-side validation
        if (!fullname || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirm_password', confirmPassword);
        
        // Send request to server
        fetch('signup.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                setTimeout(() => {
                    window.location.href = 'signin.html';
                }, 1000);
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            showNotification('An error occurred. Please try again.', 'error');
            console.error('Error:', error);
        });
    });
}

// Notification function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-size: 0.9rem;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        background: rgb(30, 176, 32);
    }
    
    .notification.error {
        background: #d62939;
    }
`;
document.head.appendChild(style);