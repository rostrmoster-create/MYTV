// Xtream Codes API Routes - v15
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function to build Xtream API URL
function buildXtreamUrl(serverUrl, username, password, action = null, params = {}) {
    let url = `${serverUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    
    if (action) {
        url += `&action=${action}`;
    }
    
    // Add additional parameters
    Object.keys(params).forEach(key => {
        url += `&${key}=${encodeURIComponent(params[key])}`;
    });
    
    return url;
}

// Helper function to normalize server URL
function normalizeServerUrl(url) {
    let normalized = url.replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = 'http://' + normalized;
    }
    return normalized;
}

// Authentication endpoint
router.post('/authenticate', async (req, res) => {
    try {
        const { serverUrl, username, password, profileName } = req.body;

        // Validate inputs
        if (!serverUrl || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                errorType: 'validation_error'
            });
        }

        console.log('Authentication attempt:', {
            profileName,
            serverUrl,
            username,
            timestamp: new Date().toISOString()
        });

        // Normalize server URL
        const normalizedUrl = normalizeServerUrl(serverUrl);
        
        // Build authentication URL
        const authUrl = buildXtreamUrl(normalizedUrl, username, password);

        // Make request to Xtream server
        const response = await axios.get(authUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'MYTV/1.0'
            }
        });

        const data = response.data;

        // Check authentication result
        if (data.user_info && (data.user_info.auth === 1 || data.user_info.auth === '1')) {
            // Store credentials in session
            req.session.xtreamCredentials = {
                serverUrl: normalizedUrl,
                username: username,
                password: password,
                profileName: profileName
            };

            req.session.userInfo = data.user_info;
            req.session.serverInfo = data.server_info;

            console.log('Authentication successful for user:', username);

            // Return success (without password)
            return res.json({
                success: true,
                userInfo: data.user_info,
                serverInfo: data.server_info,
                profileName: profileName
            });
        } else if (data.user_info && (data.user_info.auth === 0 || data.user_info.auth === '0')) {
            console.log('Authentication failed - invalid credentials');
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password',
                errorType: 'invalid_credentials'
            });
        } else {
            console.log('Unexpected response structure:', data);
            return res.status(500).json({
                success: false,
                message: 'Unexpected server response',
                errorType: 'unexpected_response'
            });
        }

    } catch (error) {
        console.error('Authentication error:', error.message);

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to Xtream server. Check the server URL.',
                errorType: 'connection_failed'
            });
        }

        if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                success: false,
                message: 'Connection timeout. The server took too long to respond.',
                errorType: 'timeout'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error during authentication',
            errorType: 'server_error'
        });
    }
});

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (!req.session.xtreamCredentials) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated. Please login first.',
            errorType: 'not_authenticated'
        });
    }
    next();
}

// Get live categories
router.get('/live-categories', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const url = buildXtreamUrl(serverUrl, username, password, 'get_live_categories');

        const response = await axios.get(url, { timeout: 10000 });
        res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
        console.error('Error fetching live categories:', error.message);
        res.status(500).json([]);
    }
});

// Get live streams
router.get('/live-streams', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { category_id } = req.query;
        
        const params = category_id ? { category_id } : {};
        const url = buildXtreamUrl(serverUrl, username, password, 'get_live_streams', params);

        const response = await axios.get(url, { timeout: 15000 });
        res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
        console.error('Error fetching live streams:', error.message);
        res.status(500).json([]);
    }
});

// Get live stream URL
router.post('/live-stream-url', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { streamId } = req.body;

        if (!streamId) {
            return res.status(400).json({ success: false, message: 'Stream ID required' });
        }

        const streamUrl = `${serverUrl}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.m3u8`;
        
        res.json({ 
            success: true, 
            streamUrl: streamUrl 
        });
    } catch (error) {
        console.error('Error generating stream URL:', error.message);
        res.status(500).json({ success: false, message: 'Error generating stream URL' });
    }
});

// Get VOD categories
router.get('/vod-categories', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const url = buildXtreamUrl(serverUrl, username, password, 'get_vod_categories');

        const response = await axios.get(url, { timeout: 10000 });
        res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
        console.error('Error fetching VOD categories:', error.message);
        res.status(500).json([]);
    }
});

// Get VOD streams
router.get('/vod-streams', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { category_id } = req.query;
        
        const params = category_id ? { category_id } : {};
        const url = buildXtreamUrl(serverUrl, username, password, 'get_vod_streams', params);

        const response = await axios.get(url, { timeout: 15000 });
        res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
        console.error('Error fetching VOD streams:', error.message);
        res.status(500).json([]);
    }
});

// Get VOD info
router.get('/vod-info/:vodId', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { vodId } = req.params;
        
        const url = buildXtreamUrl(serverUrl, username, password, 'get_vod_info', { vod_id: vodId });

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching VOD info:', error.message);
        res.status(500).json(null);
    }
});

// Get VOD stream URL
router.post('/vod-stream-url', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { streamId, containerExtension } = req.body;

        if (!streamId) {
            return res.status(400).json({ success: false, message: 'Stream ID required' });
        }

        const ext = containerExtension || 'mp4';
        const streamUrl = `${serverUrl}/movie/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.${ext}`;
        
        res.json({ 
            success: true, 
            streamUrl: streamUrl 
        });
    } catch (error) {
        console.error('Error generating VOD URL:', error.message);
        res.status(500).json({ success: false, message: 'Error generating VOD URL' });
    }
});

// Get series categories
router.get('/series-categories', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const url = buildXtreamUrl(serverUrl, username, password, 'get_series_categories');

        const response = await axios.get(url, { timeout: 10000 });
        res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
        console.error('Error fetching series categories:', error.message);
        res.status(500).json([]);
    }
});

// Get series
router.get('/series', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { category_id } = req.query;
        
        const params = category_id ? { category_id } : {};
        const url = buildXtreamUrl(serverUrl, username, password, 'get_series', params);

        const response = await axios.get(url, { timeout: 15000 });
        res.json(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
        console.error('Error fetching series:', error.message);
        res.status(500).json([]);
    }
});

// Get series info
router.get('/series-info/:seriesId', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { seriesId } = req.params;
        
        const url = buildXtreamUrl(serverUrl, username, password, 'get_series_info', { series_id: seriesId });

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching series info:', error.message);
        res.status(500).json(null);
    }
});

// Get series stream URL
router.post('/series-stream-url', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.session.xtreamCredentials;
        const { streamId, containerExtension } = req.body;

        if (!streamId) {
            return res.status(400).json({ success: false, message: 'Stream ID required' });
        }

        const ext = containerExtension || 'mp4';
        const streamUrl = `${serverUrl}/series/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.${ext}`;
        
        res.json({ 
            success: true, 
            streamUrl: streamUrl 
        });
    } catch (error) {
        console.error('Error generating series URL:', error.message);
        res.status(500).json({ success: false, message: 'Error generating series URL' });
    }
});

// Check session status
router.get('/session-status', (req, res) => {
    if (req.session.xtreamCredentials) {
        res.json({
            authenticated: true,
            profileName: req.session.xtreamCredentials.profileName,
            userInfo: req.session.userInfo
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

module.exports = router;
