// Authentication - v14 (Real Xtream Codes API with detailed debugging)
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loadingMessage = document.getElementById('loadingMessage');
    const loginBtn = document.getElementById('loginBtn');

    console.log('=== Auth.js v14 loaded ===');
    console.log('XtreamAPI available:', typeof XtreamAPI !== 'undefined');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('=== Login form submitted ===');
            
            const profileName = document.getElementById('profileName').value.trim();
            const serverUrl = document.getElementById('serverUrl').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            console.log('Form values:');
            console.log('Profile Name:', profileName);
            console.log('Server URL:', serverUrl);
            console.log('Username:', username);
            console.log('Password length:', password.length);

            // Validate inputs
            if (!profileName || !serverUrl || !username || !password) {
                showError('Please fill in all fields');
                return;
            }

            // Validate URL format
            if (!isValidUrl(serverUrl)) {
                showError('Invalid server URL format. Must start with http:// or https://');
                console.error('Invalid URL format:', serverUrl);
                return;
            }

            // Check if XtreamAPI is available
            if (typeof XtreamAPI === 'undefined') {
                showError('API module not loaded. Please refresh the page.');
                console.error('XtreamAPI is not defined!');
                return;
            }

            // Show loading state
            showLoading();

            try {
                console.log('Starting authentication...');
                
                // Authenticate with Xtream Codes API
                const authResult = await XtreamAPI.authenticate(serverUrl, username, password);

                console.log('Authentication result:', authResult);

                if (authResult.success) {
                    console.log('✓ Login successful!');
                    
                    // Normalize URL for storage
                    const normalizedUrl = XtreamAPI.normalizeServerUrl(serverUrl);
                    
                    // Save credentials and user info
                    const userData = {
                        profileName: profileName,
                        serverUrl: normalizedUrl,
                        username: username,
                        password: password,
                        userInfo: authResult.userInfo,
                        serverInfo: authResult.serverInfo,
                        loginTime: new Date().toISOString()
                    };

                    console.log('Saving user data:', {
                        ...userData,
                        password: '***'
                    });

                    StorageManager.set('currentUser', userData);
                    StorageManager.set('xtreamCredentials', {
                        serverUrl: normalizedUrl,
                        username: username,
                        password: password
                    });

                    console.log('Credentials saved, redirecting to app...');
                    
                    // Small delay to ensure storage is complete
                    setTimeout(() => {
                        window.location.href = 'app.html';
                    }, 100);
                    
                } else {
                    hideLoading();
                    
                    let errorMsg = authResult.message || 'Authentication failed';
                    
                    // Provide more specific error messages
                    if (authResult.errorType === 'cors_or_network') {
                        errorMsg = '❌ CORS Error or Network Issue\n\n';
                        errorMsg += 'The server is blocking cross-origin requests or is unreachable.\n\n';
                        errorMsg += 'Solutions:\n';
                        errorMsg += '1. Ask your IPTV provider to enable CORS\n';
                        errorMsg += '2. Use a CORS proxy\n';
                        errorMsg += '3. Use a browser extension to bypass CORS\n';
                        errorMsg += '4. Check if the server URL is correct\n\n';
                        errorMsg += 'Check browser console (F12) for details.';
                    } else if (authResult.errorType === 'invalid_credentials') {
                        errorMsg = 'Invalid username or password. Please check your credentials.';
                    } else if (authResult.errorType === 'http_error') {
                        errorMsg = `Server error (HTTP ${authResult.statusCode}). The server may be down or the URL is incorrect.`;
                    } else if (authResult.errorType === 'invalid_json') {
                        errorMsg = 'The server returned an invalid response. This may not be a valid Xtream Codes server.';
                    }
                    
                    console.error('Login failed:', errorMsg);
                    console.error('Full error details:', authResult);
                    
                    showError(errorMsg);
                }
            } catch (error) {
                hideLoading();
                console.error('Unexpected login error:', error);
                showError('Unexpected error: ' + error.message + '. Check console for details.');
            }
        });
    }

    function isValidUrl(url) {
        try {
            // Check if it starts with http:// or https://
            const urlPattern = /^https?:\/\/.+/i;
            const isValid = urlPattern.test(url);
            
            // Also try to parse it
            if (isValid) {
                const testUrl = url.includes('://') ? url : 'http://' + url;
                new URL(testUrl);
            }
            
            return isValid;
        } catch (e) {
            console.error('URL validation error:', e);
            return false;
        }
    }

    function showError(message) {
        console.log('Showing error:', message);
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorMessage.style.display = 'block';
        
        // Don't auto-hide CORS errors
        if (!message.includes('CORS')) {
            setTimeout(() => {
                errorMessage.classList.remove('show');
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 300);
            }, 8000);
        }
    }

    function showLoading() {
        console.log('Showing loading state');
        loadingMessage.style.display = 'flex';
        loginBtn.disabled = true;
        loginBtn.style.opacity = '0.6';
        errorMessage.style.display = 'none';
    }

    function hideLoading() {
        console.log('Hiding loading state');
        loadingMessage.style.display = 'none';
        loginBtn.disabled = false;
        loginBtn.style.opacity = '1';
    }
});
