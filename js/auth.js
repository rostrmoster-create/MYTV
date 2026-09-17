// Authentication - v13 (Real Xtream Codes API)
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loadingMessage = document.getElementById('loadingMessage');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const profileName = document.getElementById('profileName').value.trim();
            const serverUrl = document.getElementById('serverUrl').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            // Validate inputs
            if (!profileName || !serverUrl || !username || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Validate URL format
            if (!isValidUrl(serverUrl)) {
                showError('Invalid server URL format. Example: http://example.com:8080');
                return;
            }

            // Show loading state
            showLoading();

            try {
                // Clean URL (remove trailing slashes)
                const cleanUrl = serverUrl.replace(/\/+$/, '');

                // Authenticate with Xtream Codes API
                const authResult = await XtreamAPI.authenticate(cleanUrl, username, password);

                if (authResult.success) {
                    // Save credentials and user info
                    const userData = {
                        profileName: profileName,
                        serverUrl: cleanUrl,
                        username: username,
                        password: password,
                        userInfo: authResult.userInfo,
                        serverInfo: authResult.serverInfo,
                        loginTime: new Date().toISOString()
                    };

                    StorageManager.set('currentUser', userData);
                    StorageManager.set('xtreamCredentials', {
                        serverUrl: cleanUrl,
                        username: username,
                        password: password
                    });

                    // Redirect to app
                    window.location.href = 'app.html';
                } else {
                    hideLoading();
                    showError(authResult.message || 'Authentication failed. Please check your credentials.');
                }
            } catch (error) {
                hideLoading();
                console.error('Login error:', error);
                showError('Connection error. Please check your server URL and try again.');
            }
        });
    }

    function isValidUrl(url) {
        try {
            const urlPattern = /^https?:\/\/.+/i;
            return urlPattern.test(url);
        } catch (e) {
            return false;
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorMessage.style.display = 'block';
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 300);
        }, 5000);
    }

    function showLoading() {
        loadingMessage.style.display = 'block';
        loginBtn.disabled = true;
        loginBtn.style.opacity = '0.6';
        errorMessage.style.display = 'none';
    }

    function hideLoading() {
        loadingMessage.style.display = 'none';
        loginBtn.disabled = false;
        loginBtn.style.opacity = '1';
    }
});
