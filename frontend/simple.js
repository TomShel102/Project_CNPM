// Simple version of main.js for debugging
console.log('Simple.js loaded');

// Test functions
function showLogin() {
    console.log('showLogin called');
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('registerPage').classList.add('hidden');
}

function showRegister() {
    console.log('showRegister called');
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.remove('hidden');
}

function showLandingPage() {
    console.log('showLandingPage called');
    document.getElementById('landingPage').classList.remove('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.add('hidden');
}

// Simple login handler
async function handleLogin(e) {
    e.preventDefault();
    console.log('handleLogin called');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', username);
    
    try {
        const response = await fetch('http://localhost:6868/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        console.log('Login response:', response.status, data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            // Show main app
            document.getElementById('landingPage').classList.add('hidden');
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('registerPage').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Network error: ' + error.message);
    }
}

// Simple register handler
async function handleRegister(e) {
    e.preventDefault();
    console.log('handleRegister called');
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    console.log('Register attempt:', username, email);
    
    try {
        const response = await fetch('http://localhost:6868/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        console.log('Register response:', response.status, data);
        
        if (response.ok) {
            alert('Registration successful! You can now login.');
            showLogin();
        } else {
            alert('Registration failed: ' + data.error);
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('Network error: ' + error.message);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    showLandingPage();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up simple app...');
    
    // Setup event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener added');
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register form listener added');
    }
    
    // Show landing page
    showLandingPage();
    
    console.log('Simple app initialized');
});
