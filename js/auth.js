```javascript
/**
 * MYTV Authentication Module
 * Handles login, form validation, and user session
 */

class Auth {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.passwordInput = document.getElementById('password');

        this.init();
    }

    init() {
        // Bind event listeners
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());

        // Add input validation
        this.addInputValidation();

        // Check if user is already logged in
        this.checkExistingSession();

        // Load remembered credentials if any
        this.loadRememberedCredentials();
    }

    /**
     * Handle login form submission
     */
    async handleLogin(e) {
        e.preventDefault();

        // Hide any existing error
        this.hideError();

        // Get form values
        const credentials = {
            profileName: document.getElementById('profileName').value.trim(),
            serverUrl: document.getElementById('serverUrl').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        // Validate inputs
        if (!this.validateInputs(credentials)) {
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        // Process real API login
        await this.processLogin(credentials);
    }

    /**
     * Validate form inputs
     */
    validateInputs(credentials) {
        // Profile name validation
        if (credentials.profileName.length < 2) {
            this.showError('Profile name must be at least 2 characters long');
            return false;
        }

        // Server URL validation
        if (!this.isValidUrl(credentials.serverUrl)) {
            this.showError('Please enter a valid server URL');
            return false;
        }

        // Username validation
        if (credentials.username.length < 3) {
            this.showError('Username must be at least 3 characters long');
            return false;
        }

        // Password validation
        if (credentials.password.length < 4) {
            this.showError('Password must be at least 4 characters long');
            return false;
        }

        return true;
    }

    /**
     * Validate URL format
     */
    isValidUrl(string) {
        try {
            // Basic URL validation
            const urlPattern = /^(http|https):\/\/[^ "]+$/;
            return urlPattern.test(string);
        } catch (e) {
            return false;
        }
    }

    /**
     * Process login with real API
     */
    async processLogin(credentials) {
        try {
            // Initialize API
            const api = new API();

            api.init(
                credentials.serverUrl,
                credentials.username,
                credentials.password
            );

            // Authenticate
            const authResult = await api.authenticate();

            if (authResult.success) {
                // Save credentials and user data
                const userData = {
                    profileName: credentials.profileName,
                    serverUrl: credentials.serverUrl,
                    username: credentials.username,
                    password: credentials.password, // Store encrypted in production!
                    loggedIn: true,
                    loginTime: new Date().toISOString(),
                    userInfo: authResult.data.user_info,
                    serverInfo: authResult.data.server_info
                };

                localStorage.setItem(
                    'mytvUser',
                    JSON.stringify(userData)
                );

                // Save credentials if remember me is checked
                if (credentials.rememberMe) {
                    this.saveCredentials(credentials);
                } else {
                    this.clearSavedCredentials();
                }

                // Success - redirect to main app
                this.loginSuccess();
            } else {
                // Show API authentication error
                this.showError(
                    authResult.error ||
                    'Invalid credentials. Please check your server URL, username, and password.'
                );
            }
        } catch (error) {
            console.error('Login error:', error);

            this.showError(
                'Connection error. Please check your server URL and internet connection.'
            );
        }
    }

    /**
     * Handle successful login
     */
    loginSuccess() {
        this.setLoadingState(false);

        // Add success animation
        this.loginBtn.style.background =
            'linear-gradient(135deg, #10B981 0%, #059669 100%)';

        this.loginBtn.innerHTML = `
            <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none">

                <path
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fill="white"/>
            </svg>

            <span>Success!</span>
        `;

        // Redirect to main app after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
        this.setLoadingState(false);
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.style.display = 'none';
    }

    /**
     * Toggle password visibility
     */
    togglePassword() {
        const type =
            this.passwordInput.type === 'password'
                ? 'text'
                : 'password';

        this.passwordInput.type = type;

        // Update icon
        const icon =
            this.togglePasswordBtn.querySelector('.eye-icon');

        if (type === 'text') {
            icon.innerHTML = `
                <path
                    d="M10 4C4.5 4 1 10 1 10C1 10 4.5 16 10 16C15.5 16 19 10 19 10C19 10 15.5 4 10 4Z"
                    stroke="#9CA3AF"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <circle
                    cx="10"
                    cy="10"
                    r="3"
                    stroke="#9CA3AF"
                    stroke-width="1.5"/>

                <line
                    x1="2"
                    y1="2"
                    x2="18"
                    y2="18"
                    stroke="#9CA3AF"
                    stroke-width="1.5"
                    stroke-linecap="round"/>
            `;
        } else {
            icon.innerHTML = `
                <path
                    d="M10 4C4.5 4 1 10 1 10C1 10 4.5 16 10 16C15.5 16 19 10 19 10C19 10 15.5 4 10 4Z"
                    stroke="#9CA3AF"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>

                <circle
                    cx="10"
                    cy="10"
                    r="3"
                    stroke="#9CA3AF"
                    stroke-width="1.5"/>
            `;
        }
    }

    /**
     * Set loading state for login button
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.loginBtn.classList.add('loading');
            this.loginBtn.disabled = true;
        } else {
            this.loginBtn.classList.remove('loading');
            this.loginBtn.disabled = false;
        }
    }

    /**
     * Add real-time input validation
     */
    addInputValidation() {
        const inputs =
            this.form.querySelectorAll(
                'input[type="text"], input[type="password"]'
            );

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.errorMessage.style.display === 'flex') {
                    this.hideError();
                }
            });
        });
    }

    /**
     * Check if user already has an active session
     */
    checkExistingSession() {
        const userData =
            localStorage.getItem('mytvUser');

        if (userData) {
            try {
                const user =
                    JSON.parse(userData);

                if (user.loggedIn) {
                    // User is already logged in
                    console.log(
                        'User already logged in:',
                        user.profileName
                    );

                    // Redirect can be enabled if desired
                    // window.location.href = 'index.html';
                }
            } catch (e) {
                console.error(
                    'Error parsing user data:',
                    e
                );
            }
        }
    }

    /**
     * Save credentials for "Remember Me" functionality
     */
    saveCredentials(credentials) {
        const savedCreds = {
            profileName: credentials.profileName,
            serverUrl: credentials.serverUrl,
            username: credentials.username
        };

        localStorage.setItem(
            'mytvRemembered',
            JSON.stringify(savedCreds)
        );
    }

    /**
     * Load remembered credentials
     */
    loadRememberedCredentials() {
        const savedCreds =
            localStorage.getItem('mytvRemembered');

        if (savedCreds) {
            try {
                const creds =
                    JSON.parse(savedCreds);

                document.getElementById('profileName').value =
                    creds.profileName || '';

                document.getElementById('serverUrl').value =
                    creds.serverUrl || '';

                document.getElementById('username').value =
                    creds.username || '';

                document.getElementById('rememberMe').checked =
                    true;
            } catch (e) {
                console.error(
                    'Error loading remembered credentials:',
                    e
                );
            }
        }
    }

    /**
     * Clear saved credentials
     */
    clearSavedCredentials() {
        localStorage.removeItem('mytvRemembered');
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});
```
