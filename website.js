// Website Server für Suka Supreme Bot
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const CONFIG_FILE = './config.json';

// Helper to get IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

function startWebsite() {
    const app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.static('public'));
    
    // Session Storage (In-Memory für Demo)
    const sessions = new Map();
    
    // Login Check Middleware
    function requireAuth(req, res, next) {
        const token = req.headers['authorization'];
        if (!token || !sessions.has(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    }
    
    // Load Config
    function loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (error) {
            return {};
        }
    }
    
    // Save Config
    function saveConfig(config) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    }
    
    // Routes
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    app.post('/api/login', (req, res) => {
        const { password } = req.body;
        const config = loadConfig();
        
        if (password === config.admin_password) {
            const token = Math.random().toString(36).substr(2);
            sessions.set(token, { login: new Date() });
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, error: 'Invalid password' });
        }
    });
    
    app.post('/api/logout', requireAuth, (req, res) => {
        const token = req.headers['authorization'];
        sessions.delete(token);
        res.json({ success: true });
    });
    
    // API - User Data
    app.get('/api/users', (req, res) => {
        try {
            const userData = JSON.parse(fs.readFileSync('./user_data.json', 'utf8'));
            res.json(userData);
        } catch (error) {
            res.json({});
        }
    });
    
    // API - User Details
    app.get('/api/user/:id', (req, res) => {
        try {
            const userData = JSON.parse(fs.readFileSync('./user_data.json', 'utf8'));
            const user = userData[req.params.id];
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    });
    
    // API - Bot Status
    app.get('/api/status', (req, res) => {
        const status = {
            status: global.botState?.connected ? 'online' : 'offline',
            name: 'Suka Supreme Bot',
            version: '1.0.0',
            uptime: global.botState?.uptime || '0h 0m',
            messagesProcessed: global.botState?.messagesProcessed || 0,
            startTime: global.botState?.startTime || new Date(),
            totalUsers: Object.keys(global.userData || {}).length
        };
        res.json(status);
    });
    
    // API - Admin Panel Data
    app.get('/api/admin/status', requireAuth, (req, res) => {
        const config = loadConfig();
        const userData = global.userData || {};
        
        res.json({
            botStatus: global.botState,
            commandsEnabled: config.commands_enabled || {},
            bannedUsers: config.banned_users || [],
            totalUsers: Object.keys(userData).length,
            totalMoney: Object.values(userData).reduce((sum, user) => sum + (user.money || 0), 0)
        });
    });
    
    // API - Toggle Command
    app.post('/api/admin/command/:cmd', requireAuth, (req, res) => {
        const { enabled } = req.body;
        const cmd = req.params.cmd;
        const config = loadConfig();
        
        if (!config.commands_enabled) config.commands_enabled = {};
        config.commands_enabled[cmd] = enabled;
        saveConfig(config);
        
        // Update global config
        global.config = config;
        
        res.json({ success: true, command: cmd, enabled });
    });
    
    // API - Ban User
    app.post('/api/admin/ban/:user', requireAuth, (req, res) => {
        const user = req.params.user;
        const config = loadConfig();
        
        if (!config.banned_users) config.banned_users = [];
        if (!config.banned_users.includes(user)) {
            config.banned_users.push(user);
            saveConfig(config);
            global.config = config;
            res.json({ success: true, action: 'banned', user });
        } else {
            res.json({ success: false, error: 'User already banned' });
        }
    });
    
    // API - Unban User
    app.post('/api/admin/unban/:user', requireAuth, (req, res) => {
        const user = req.params.user;
        const config = loadConfig();
        
        if (!config.banned_users) config.banned_users = [];
        config.banned_users = config.banned_users.filter(u => u !== user);
        saveConfig(config);
        global.config = config;
        res.json({ success: true, action: 'unbanned', user });
    });
    
    // API - Get All Commands Status
    app.get('/api/admin/commands', requireAuth, (req, res) => {
        const config = loadConfig();
        res.json(config.commands_enabled || {});
    });
    
    app.listen(PORT, () => {
        const ip = getLocalIP();
        console.log(`🌐 Website läuft auf http://${ip}:${PORT}`);
        console.log(`🌐 Website läuft auf http://localhost:${PORT}`);
        console.log(`🔐 Admin Panel: http://${ip}:${PORT}/admin`);
    });
}

module.exports = { startWebsite };
