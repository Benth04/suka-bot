// Website Server für Suka Supreme Bot
const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

function startWebsite() {
    const app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.static('public'));
    
    // Routes
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
        res.json({ 
            status: 'online',
            name: 'Suka Supreme Bot',
            version: '1.0.0'
        });
    });
    
    app.listen(PORT, () => {
        console.log(`🌐 Website läuft auf http://localhost:${PORT}`);
    });
}

module.exports = { startWebsite };
