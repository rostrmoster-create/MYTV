// Authentication - v12
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            // Validate inputs
            if (!username || !password) {
                showError('Please enter both username and password');
                return;
            }

            // Accept any credentials for demo
            const user = {
                username: username,
                email: username + '@mytv.com',
                loginTime: new Date().toISOString()
            };

            // Store user data
            StorageManager.set('currentUser', user);

            // Redirect to app
            window.location.href = 'app.html';
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
});
