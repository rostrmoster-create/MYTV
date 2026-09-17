// MYTV Authentication Handler - v16 (JWT)

class AuthManager {
    static async login(serverUrl, username, password, profileName) {
        try {
            // Show loading state
            const loginBtn = document.querySelector('.login-btn');
            const errorMsg = document.getElementById('error-message');
            const originalBtnText = loginBtn.textContent;
            
            loginBtn.textContent = 'Authenticating...';
            loginBtn.disabled = true;
            errorMsg.style.display = 'none';

            console.log('Attempting authentication...');

            // Authenticate via backend - returns token
            const response = await XtreamAPI.authenticate(serverUrl, username, password, profileName);

            console.log('Authentication successful, token received');

            // Token is already stored by XtreamAPI.authenticate()
            // Save profile info to localStorage (NOT credentials)
            const profileData = {
                profileName: profileName,
                userInfo: response.user_info,
                serverInfo: response.server_info,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('currentProfile', JSON.stringify(profileData));
            console.log('Profile data saved to localStorage');

            // Redirect to app
            console.log('Redirecting to app.html...');
            window.location.href = 'app.html';

        } catch (error) {
            console.error('Login failed:', error);
            
            const errorMsg = document.getElementById('error-message');
            const loginBtn = document.querySelector('.login-btn');
            
            // Show user-friendly error messages
            let errorText = 'Login failed. ';
            
            if (error.message.includes('fetch')) {
                errorText += 'Cannot connect to backend server. Please ensure the backend is deployed and running.';
            } else if (error.message.includes('credentials')) {
                errorText += 'Invalid username or password.';
            } else if (error.message.includes('timeout')) {
                errorText += 'Connection timeout. Please try again.';
            } else if (error.message.includes('server')) {
                errorText += 'Cannot connect to IPTV server. Please check the server URL.';
            } else {
                errorText += error.message || 'Unknown error occurred.';
            }
            
            errorMsg.textContent = errorText;
            errorMsg.style.display = 'block';
            
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    }

    static async checkAuth() {
        console.log('Checking authentication...');
        
        // Check if user has JWT token
        const token = XtreamAPI.getToken();
        
        if (!token) {
            console.log('No auth token found, redirecting to login...');
            this.redirectToLogin();
            return false;
        }

        console.log('Token found in localStorage');

        // Check if profile data exists
        const profileData = localStorage.getItem('currentProfile');
        
        if (!profileData) {
            console.log('No profile data found, redirecting to login...');
            this.redirectToLogin();
            return false;
        }

        console.log('Profile data found');

        // Verify token is still valid by checking session status
        try {
            console.log('Verifying token with backend...');
            const sessionStatus = await XtreamAPI.checkSession();
            
            if (!sessionStatus || !sessionStatus.authenticated) {
                console.log('Token expired or invalid, redirecting to login...');
                XtreamAPI.clearToken();
                localStorage.removeItem('currentProfile');
                this.redirectToLogin();
                return false;
            }

            console.log('Authentication verified successfully, user is logged in');
            return true;

        } catch (error) {
            console.error('Session check failed:', error);
            XtreamAPI.clearToken();
            localStorage.removeItem('currentProfile');
            this.redirectToLogin();
            return false;
        }
    }

    static redirectToLogin() {
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.endsWith('/') &&
            !window.location.pathname.endsWith('/index.html')) {
            console.log('Redirecting to login page...');
            window.location.href = 'login.html';
        }
    }

    static async logout() {
        console.log('Logging out...');
        
        // Clear JWT token
        await XtreamAPI.logout();
        
        // Clear local storage
        localStorage.removeItem('currentProfile');
        
        // Redirect to login
        window.location.href = 'login.html';
    }

    static getCurrentProfile() {
        const profileData = localStorage.getItem('currentProfile');
        return profileData ? JSON.parse(profileData) : null;
    }
}

// Initialize auth on login page
if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('login-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const profileName = document.getElementById('profile-name').value.trim();
                const serverUrl = document.getElementById('server-url').value.trim();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;

                if (!profileName || !serverUrl || !username || !password) {
                    const errorMsg = document.getElementById('error-message');
                    errorMsg.textContent = 'Please fill in all fields.';
                    errorMsg.style.display = 'block';
                    return;
                }

                await AuthManager.login(serverUrl, username, password, profileName);
            });
        }
    });
}

// Check auth on app pages
if (window.location.pathname.includes('app.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('App page loaded, checking authentication...');
        
        const isAuthenticated = await AuthManager.checkAuth();
        
        if (!isAuthenticated) {
            console.log('Not authenticated, will redirect to login');
            return; // Will be redirected by checkAuth
        }

        console.log('User authenticated, loading app...');

        // Display user info
        const profile = AuthManager.getCurrentProfile();
        if (profile) {
            const profileNameEl = document.getElementById('profile-name-display');
            if (profileNameEl) {
                profileNameEl.textContent = profile.profileName;
            }

            // Display server info if available
            if (profile.serverInfo && profile.serverInfo.server_protocol) {
                console.log('Connected to:', profile.serverInfo.url || 'Xtream Server');
            }
        }
    });
}
