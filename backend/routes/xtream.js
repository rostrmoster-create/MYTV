const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Get JWT secret from environment
const JWT_SECRET = process.env.SESSION_SECRET || 'change_this_to_a_random_secret_string_min_32_characters';

// Middleware to verify and decode JWT token
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated - no token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.xtreamCredentials = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Not authenticated - invalid token' });
    }
};

// Authenticate user and create JWT token
router.post('/authenticate', async (req, res) => {
    try {
        const { serverUrl, username, password, profileName } = req.body;

        if (!serverUrl || !username || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Clean server URL
        const cleanServerUrl = serverUrl.replace(/\/$/, '');

        console.log('Authenticating user...');

        // Authenticate with Xtream Codes API
        const authUrl = `${cleanServerUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        const response = await axios.get(authUrl, { timeout: 10000 });

        if (!response.data || !response.data.user_info) {
            console.log('Authentication failed - invalid credentials');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Authentication successful!');

        // Create JWT token with credentials
        const token = jwt.sign(
            {
                serverUrl: cleanServerUrl,
                username,
                password,
                profileName
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return token and user info (NOT credentials in the response body)
        res.json({
            token,
            user_info: response.data.user_info,
            server_info: response.data.server_info || {}
        });

    } catch (error) {
        console.error('Authentication error:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: 'Connection timeout' });
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: 'Cannot connect to server' });
        }
        
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Check token validity
router.get('/session-status', requireAuth, (req, res) => {
    res.json({
        authenticated: true,
        profile: req.xtreamCredentials.profileName
    });
});

// Logout (client-side will delete token)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Get Live Categories
router.get('/live-categories', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`;

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching live categories:', error.message);
        res.status(500).json({ error: 'Failed to fetch live categories' });
    }
});

// Get Live Streams
router.get('/live-streams', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const categoryId = req.query.category_id;

        let url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching live streams:', error.message);
        res.status(500).json({ error: 'Failed to fetch live streams' });
    }
});

// Get Live Stream URL
router.post('/live-stream-url', requireAuth, (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const { streamId } = req.body;

        if (!streamId) {
            return res.status(400).json({ error: 'Stream ID required' });
        }

        const url = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
        res.json({ url });

    } catch (error) {
        console.error('Error generating live stream URL:', error.message);
        res.status(500).json({ error: 'Failed to generate stream URL' });
    }
});

// Get VOD Categories
router.get('/vod-categories', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching VOD categories:', error.message);
        res.status(500).json({ error: 'Failed to fetch VOD categories' });
    }
});

// Get VOD Streams
router.get('/vod-streams', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const categoryId = req.query.category_id;

        let url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching VOD streams:', error.message);
        res.status(500).json({ error: 'Failed to fetch VOD streams' });
    }
});

// Get VOD Stream URL
router.post('/vod-stream-url', requireAuth, (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const { streamId, containerExtension } = req.body;

        if (!streamId) {
            return res.status(400).json({ error: 'Stream ID required' });
        }

        const ext = containerExtension || 'mp4';
        const url = `${serverUrl}/movie/${username}/${password}/${streamId}.${ext}`;
        res.json({ url });

    } catch (error) {
        console.error('Error generating VOD stream URL:', error.message);
        res.status(500).json({ error: 'Failed to generate stream URL' });
    }
});

// Get VOD Info
router.get('/vod-info/:vodId', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const { vodId } = req.params;

        const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${vodId}`;

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching VOD info:', error.message);
        res.status(500).json({ error: 'Failed to fetch VOD info' });
    }
});

// Get Series Categories
router.get('/series-categories', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`;

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching series categories:', error.message);
        res.status(500).json({ error: 'Failed to fetch series categories' });
    }
});

// Get Series
router.get('/series', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const categoryId = req.query.category_id;

        let url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching series:', error.message);
        res.status(500).json({ error: 'Failed to fetch series' });
    }
});

// Get Series Info
router.get('/series-info/:seriesId', requireAuth, async (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const { seriesId } = req.params;

        const url = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;

        const response = await axios.get(url, { timeout: 10000 });
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching series info:', error.message);
        res.status(500).json({ error: 'Failed to fetch series info' });
    }
});

// Get Series Stream URL
router.post('/series-stream-url', requireAuth, (req, res) => {
    try {
        const { serverUrl, username, password } = req.xtreamCredentials;
        const { streamId, containerExtension } = req.body;

        if (!streamId) {
            return res.status(400).json({ error: 'Stream ID required' });
        }

        const ext = containerExtension || 'mp4';
        const url = `${serverUrl}/series/${username}/${password}/${streamId}.${ext}`;
        res.json({ url });

    } catch (error) {
        console.error('Error generating series stream URL:', error.message);
        res.status(500).json({ error: 'Failed to generate stream URL' });
    }
});

module.exports = router;
