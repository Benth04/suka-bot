# Suka Supreme Bot 🤖

Ein WhatsApp Bot mit Dashboard und Admin Panel

## Features

- 🤖 WhatsApp Bot mit vielen Commands
- 🌐 Web Dashboard auf Railway.app
- 🔐 Admin Panel mit Login
- ⚙️ Command Management (An/Aus)
- 🚫 Ban System
- 📊 Live Bot Status & Statistiken
- 👥 Benutzer Verwaltung

## Deployment auf Railway.app

### Schritt 1: Repository auf GitHub hochladen
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/dein-username/suka-bot.git
git push -u origin main
```

### Schritt 2: Railway Projekt erstellen
1. Gehe zu [railway.app](https://railway.app)
2. Klicke auf "New Project"
3. Wähle "Deploy from GitHub"
4. Wähle dein `suka-bot` Repository
5. Railway wird automatisch `Procfile` nutzen

### Schritt 3: Environment Variables setzen
Im Railway Dashboard unter "Variables":
- `PORT`: `8080` (wird automatisch gesetzt)
- `NODE_ENV`: `production`
- `ADMIN_PASSWORD`: Dein Admin Passwort

### Schritt 4: Deploy
Railway deployed automatisch beim Push zu GitHub!

## Lokal starten

```bash
npm install
npm start
```

Website läuft dann auf:
- Lokal: `http://localhost:8080`
- Railway: `https://suka-bot-production.up.railway.app:8080`

## Admin Panel

- **URL**: `https://suka-bot-production.up.railway.app:8080`
- **Passwort**: Siehe `.env` oder config.json

## Environment Variables

Erstelle eine `.env` Datei basierend auf `.env.example`:

```
PORT=8080
NODE_ENV=production
ADMIN_PASSWORD=admin123
```

## WhatsApp Bot Commands

Schreibe `/menu` an den Bot für alle Commands

## Struktur

```
suka-bot/
├── index.js           # Bot Hauptdatei
├── website.js         # Express Server
├── config.json        # Konfiguration
├── package.json       # Dependencies
├── Procfile           # Railway Config
├── .env.example       # Environment Template
├── public/
│   └── index.html     # Dashboard HTML
├── auth/              # WhatsApp Auth (wird erstellt)
├── user_data.json     # Spielerdaten
└── database.json      # Datenbank
```

## Troubleshooting

**Bot verbindet sich nicht:**
- QR-Code in der Console scannen
- Auth-Folder nicht gelöschen

**Dashboard zeigt keine Daten:**
- Admin Password checken
- Browser Cache leeren (Ctrl+Shift+Delete)

**Railway Build failed:**
- `npm install` lokal laufen lassen
- `package-lock.json` hochladen
- Railway Logs checken

## Lizenz

MIT
