# 🤖 SUKA SUPREME BOT v2.0 - COMMAND GUIDE

## 📋 Übersicht

Der neue Bot hat **~150 BEFEHLE** in folgenden Kategorien:

### Kategorien:
1. 💰 **ECONOMY** (10 Commands) - Finanz-Management
2. 🛒 **SHOP & INVENTORY** (10 Commands) - Items kaufen/verkaufen
3. ⚔️ **FIGHT & COMBAT** (9 Commands) - Kämpfen und Duell
4. 🎮 **GAMES & GAMBLING** (8 Commands) - Spiele und Wetten
5. 😂 **FUN** (10 Commands) - Lustige Interaktionen
6. 🏆 **LEVEL & XP** (8 Commands) - Level und Rang System
7. 👨‍👨‍👧‍👦 **CLAN SYSTEM** (9 Commands) - Clan Management
8. 💼 **WORK & JOBS** (8 Commands) - Arbeiten verdienen
9. 🔑 **OWNER** (11 Commands) - Admin & Owner Befehle

---

## 📖 COMMAND GRUPPEN

### 1️⃣ ECONOMY COMMANDS (10)
```
/balance, /bal        - Geld & Bank anzeigen
/wallet               - Geldbörse Info
/bank                 - Bank Informationen
/deposit <betrag>     - Geld einzahlen
/withdraw <betrag>    - Geld abheben
/transfer @user       - Geld an User senden
/leaderboard          - Top 10 Spieler
/daily                - 500€ täglich
/weekly               - 2000€ wöchentlich
/monthly              - 10000€ monatlich
```

### 2️⃣ SHOP & INVENTORY (10)
```
/shop                 - Shop anzeigen
/buy <item>           - Item kaufen
/sell <item>          - Item verkaufen
/inventory, /inv      - Inventar anzeigen
/items                - Items auflisten
/use <item>           - Item benutzen
/equip <item>         - Item ausrüsten
/drop <item>          - Item fallen lassen
/market               - Marktplatz
/price <item>         - Preis prüfen
```

**Shop Items:**
- Sword: 500€
- Shield: 400€
- Armor: 1000€
- Potion: 100€
- Gold Bar: 5000€
- Legendary Sword: 10000€

### 3️⃣ FIGHT & COMBAT (9)
```
/fight @user          - Mit User kämpfen
/duel @user           - Duell starten
/stats                - Deine Stats
/hp                   - Health anzeigen
/heal                 - Dich heilen (100 HP)
/attack <user>        - Angreifen
/defend               - Verteidigen
/weapons              - Waffen zeigen
/strength             - Stärke trainieren
```

### 4️⃣ GAMES & GAMBLING (8)
```
/slot <betrag>        - Slots spielen (5x Gewinn bei Match!)
/coinflip <betrag>    - Münzwurf (kopf/zahl)
/dice                 - Würfeln (1-6)
/casino               - Casino spielen
/roulette             - Roulette spielen
/bet <betrag>         - Wetten
/jackpot              - Jackpot versuchen
/blackjack            - Blackjack spielen
```

### 5️⃣ FUN COMMANDS (10)
```
/roast @user          - Verspotte User (zufällig)
/compliment @user     - Kompliment (zufällig)
/love @user           - Liebe ausdrücken
/hug @user            - Umarmen
/slap @user           - Schlagen
/punch @user          - Boxen
/kiss @user           - Küssen
/respect              - Respekt zeigen
/sus @user            - Sus Check
/meme                 - Meme anzeigen
```

### 6️⃣ LEVEL & XP (8)
```
/level                - Level anzeigen
/xp                   - XP anzeigen (+10 XP/Befehl)
/rank                 - Dein Rang (basierend auf Level)
/prestige             - Level Reset auf 1 + 50000€ (braucht Lv50)
/skills               - Skills anzeigen
/achievements         - Erfolge anzeigen
/profile              - Dein Profil
/stats                - Detaillierte Stats
```

**Rang Progression:**
- 0-10: Anfänger
- 10-20: Novize
- 20-30: Junior
- 30-40: Senior
- 40-50: Meister
- 50-60: Legend
- 60-70: Titan
- 70+: Gott

### 7️⃣ CLAN SYSTEM (9)
```
/clan                 - Clan Info
/clancreate <name>    - Clan erstellen
/claninvite @user     - User einladen
/clankick @user       - User rauswerfen
/claninfo             - Clan Infos
/clanbank             - Clan Bank
/clanwar <clan>       - Clankrieg starten
/gang                 - Gang Befehle
/family               - Familie Befehle
```

### 8️⃣ WORK & JOBS (8)
```
/work                 - Arbeiten (+100-600€, +5XP)
/job                  - Job Info
/jobs                 - Alle Jobs anzeigen
/apply <job>          - Job annehmen
/quitjob              - Job kündigen
/salary               - Gehalt anzeigen
/overtime             - Überstunden
/promotion            - Beförderung
```

### 9️⃣ OWNER COMMANDS (11) - NUR FÜR OWNER!
```
/addmoney <betrag>    - Geld hinzufügen
/setmoney <betrag>    - Geld setzen
/resetuser @user      - User komplett reset
/kick @user           - User kicken
/ban @user            - User bannen
/unban @user          - User entbannen
/promote @user        - User promoten
/shutdown             - Bot herunterfahren
/settings             - Einstellungen
/warnings @user       - Verwarnungen anzeigen
/addmoney <bet> @user - Anderen User Geld geben
```

---

## 🎮 BASIC COMMANDS (Immer verfügbar)
```
/menu                 - Hauptmenü (9 Kategorien)
/menu 1-9             - Spezifische Kategorie anzeigen
/help                 - Hilfe anzeigen
/info                 - Bot Info
/ping                 - Pong!
/uptime               - Bot Uptime
/version              - Version anzeigen
/rules                - Regeln
/status               - Bot Status
/profile              - Dein Profil
```

---

## 💾 DATENSPEICHERUNG

Der Bot speichert alle User-Daten in `database.json`:

```json
{
  "users": {
    "123456789@s.whatsapp.net": {
      "money": 1000,
      "bank": 5000,
      "loan": 0,
      "inventory": ["Sword", "Shield"],
      "xp": 150,
      "level": 5,
      "warnings": 0,
      "jailed": false,
      "job": "Arbeiter",
      "health": 100,
      "weapon": "Fäuste",
      "houses": [],
      "cars": [],
      "clan": "Dragons",
      "daily": { "last": "2025-02-09", "streak": 5 }
    }
  }
}
```

---

## 🔐 OWNER SICHERHEIT

Die folgenden User IDs sind Owner:
- `+49 1515 0928935@s.whatsapp.net`
- `+49 1515 0928935` (ohne Suffix)
- `2472489695390@lid` (LID Format)

Owner-Commands sind protected und nur dieser User kann sie ausführen!

---

## 🎲 BEISPIELE FÜR COMMANDS

### Economy
```
/balance            → 💵 Geld: 5000€ | 🏦 Bank: 10000€
/deposit 1000       → ✅ 1000€ eingezahlt
/daily              → ✅ +500€ Daily Bonus! Streak: 5
```

### Games
```
/slot 100           → 🎰 🍒 🍒 🍒 ✅ Du gewinnst 500€!
/coinflip 50 kopf   → 🪙 KOPF ✅ Du gewinnst 100€!
/dice               → 🎲 Du würfelst: 4
```

### Fight
```
/fight @user        → ⚔️ Du hast gekämpft! 💥 -25 HP | ❤️ Deine HP: 75
/heal               → 💖 Du wurdest geheilt! ❤️ 100 HP
```

### Level
```
/xp                 → ✨ +10 XP | XP: 160/200
/prestige           → 🌟 PRESTIGE! ✨ Level 1 + 💰 +50000€
```

---

## 📊 USER STATISTIKEN

Jeder User hat:
- **💰 Geld** - Bargeld zum Ausgeben
- **🏦 Bank** - Sicheres Geld mit Zinsen
- **💸 Schulden** - Loans die zurückgezahlt werden müssen
- **📊 Level** - 1-100+ (mit Prestige)
- **✨ XP** - Sammle XP um Level zu steigen
- **❤️ HP** - Health (sinkt bei Kämpfen, max 100)
- **🎒 Inventar** - Items (max 20)
- **💼 Job** - Arbeiten für Geld
- **🏰 Clan** - Dem Clan beitreten
- **🏆 Rang** - Status basierend auf Level

---

## 🚀 START GUIDE

1. **Beginne mit /menu**
   - Sehe alle verfügbaren Commands
   - Wähle eine Kategorie (1-9)

2. **Verdiene Geld**
   - /work → +100-600€
   - /daily → +500€ (täglich)
   - /crime → +500-1000€ (risiko!)

3. **Steige Level auf**
   - Jeder Command gibt +5 XP
   - 100 XP = Level Up
   - Level 50 = /prestige möglich

4. **Kaufe Items im Shop**
   - /shop → Alle Items anzeigen
   - /buy sword → Kaufe Sword für 500€

5. **Spiele Games**
   - /slot 100 → Slots
   - /coinflip 50 kopf → Münzwurf
   - /dice → Würfeln

6. **Kämpfe mit anderen**
   - /fight @user → Duell
   - /duel @user → Epic Kampf

---

## ⚡ TIPPS & TRICKS

- 💡 **Daily+Weekly+Monthly** = schnell Geld verdienen
- 💡 **Level System** kombiniert mit Jobs für mehr Geld
- 💡 **Prestige** bei Level 50 für 50000€ Bonus
- 💡 **/leaderboard** um Top Spieler zu sehen
- 💡 **Clan System** - Tritt einem Clan bei für Boni
- 💡 **Shop Items** - Investiere in gute Ausrüstung

---

**Bot Version**: 2.0  
**Commands**: ~150  
**Owner**: +49 1515 0928935  
**Zuletzt aktualisiert**: 9. Februar 2026
