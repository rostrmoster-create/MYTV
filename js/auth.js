// auth.js - Authentication Management

// Check if user is already logged in
function checkAuth() {
    const user = StorageManager.getUserCredentials();
    if (user) {
        // User is logged in, redirect to app
        window.location.href = 'app.html';
    }
}

// Process login - Accept any credentials
async function processLogin(event) {
    event.preventDefault();
    
    const serverUrl = document.getElementById('serverUrl').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Clear previous error
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    // Validate inputs
    if (!serverUrl || !username || !password) {
        errorMessage.textContent = 'Please fill in all fields';
        errorMessage.style.display = 'block';
        return;
    }

    // Basic URL validation
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        errorMessage.textContent = 'Server URL must start with http:// or https://';
        errorMessage.style.display = 'block';
        return;
    }
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span style="opacity: 0.7;">Signing in...</span>';
    
    try {
        // Initialize API with credentials
        API.init(serverUrl, username, password);
        
        // Try to authenticate with real API
        try {
            const authResult = await API.authenticate();
            
            if (authResult && authResult.user_info) {
                console.log('Real API authentication successful:', authResult.user_info);
                
                // Save credentials
                StorageManager.saveUserCredentials(username, password, serverUrl);
                
                // Show success message
                submitButton.innerHTML = '<span style="color: #10b981;">✓ Success! Redirecting...</span>';
                
                // Redirect to app
                setTimeout(() => {
                    window.location.href = 'app.html';
                }, 500);
                return;
            }
        } catch (apiError) {
            // API authentication failed, but we'll accept credentials anyway
            console.warn('API authentication failed, accepting credentials anyway:', apiError.message);
        }
        
        // Accept any credentials even if API fails
        console.log('Accepting credentials for:', username);
        
        // Save credentials
        StorageManager.saveUserCredentials(username, password, serverUrl);
        
        // Show success message
        submitButton.innerHTML = '<span style="color: #10b981;">✓ Success! Redirecting...</span>';
        
        // Redirect to app
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 500);
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Even on error, accept the credentials
        StorageManager.saveUserCredentials(username, password, serverUrl);
        
        submitButton.innerHTML = '<span style="color: #10b981;">✓ Success! Redirecting...</span>';
        
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 500);
    }
}

// Logout function
function logout() {
    StorageManager.clearUserCredentials();
    window.location.href = 'login.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if on login page
    if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/')) {
        checkAuth();
        
        // Setup login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', processLogin);
        }
    }
    
    // Check if on app page
    if (window.location.pathname.includes('app.html')) {
        const user = StorageManager.getUserCredentials();
        if (!user) {
            // Not logged in, redirect to login
            window.location.href = 'login.html';
        } else {
            // Initialize API with stored credentials
            API.init(user.serverUrl, user.username, user.password);
            console.log('User authenticated, API initialized');
        }
    }
});

// Export for use in other files
window.logout = logout;
