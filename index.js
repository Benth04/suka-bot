console.log("🤖 BOT MIT ~150 COMMANDS STARTET JETZT");
// ===========================
// SUKA SUPREME BOT v2.0
// ~150 BEFEHLE
// Owner: +49 1515 0928935
// ===========================

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { startWebsite } = require('./website');

const PREFIX = '/';
const BOT_OWNER = '+49 1515 0928935@s.whatsapp.net';
const OWNER_LID = '2472489695390@lid';
const DB_FILE = './database.json';
const START_TIME = Date.now();
let websiteStarted = false;

let db = { users: {} };
if (fs.existsSync(DB_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(DB_FILE));
    db = (loaded && loaded.users) ? loaded : { users: {} };
  } catch(e) {
    console.log('⚠️ Datenbankdatei beschädigt, erstelle neue...');
    db = { users: {} };
  }
}
const saveDB = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  global.userData = db.users;
};

// Initialize global state for website
global.userData = db.users;
global.botState = {
  connected: false,
  uptime: '0h 0m',
  messagesProcessed: 0,
  startTime: new Date(),
  commandsExecuted: 0
};

// Simple ranks stub (can be replaced with a real implementation)
const ranks = { getRank: (id) => 'member' };

// Per-chat prefix helpers
function getPrefixForChat(chatId) {
  if (!db.chats) db.chats = {};
  if (!db.chats[chatId]) return PREFIX;
  return db.chats[chatId].prefix || PREFIX;
}

function setPrefixForChat(chatId, newPrefix) {
  if (!db.chats) db.chats = {};
  if (!db.chats[chatId]) db.chats[chatId] = {};
  if (!newPrefix || newPrefix === 'default') {
    if (db.chats[chatId]) delete db.chats[chatId].prefix;
    if (db.chats[chatId] && Object.keys(db.chats[chatId]).length === 0) delete db.chats[chatId];
  } else {
    db.chats[chatId].prefix = newPrefix;
  }
  saveDB();
}

function getUser(id) {
  if (!db.users) db.users = {};
  if (!db.users[id]) {
    db.users[id] = {
      money: 1000,
      bank: 0,
      loan: 0,
      inventory: [],
      xp: 0,
      level: 1,
      warnings: 0,
      jailed: false,
      job: null,
      cooldowns: {},
      health: 100,
      weapon: "Fäuste",
      houses: [],
      cars: [],
      clan: null,
      daily: { last: null, streak: 0 }
    };
  }
  return db.users[id];
}

// ===== COMMAND LISTS =====
const BASIC = ["menu","help","info","ping","uptime","version","rules","status","profile"];
const GROUP = ["admins","owner","tagall","hidetag","link","invite","report","warn","warnings","clear"];
const MOD = ["mute","unmute","lock","unlock","slowmode","antilink","antispam"];
const OWNER_CMDS = ["kick","add","promote","demote","bot","reset","shutdown","addmoney","setmoney","resetuser","ban","unban"];

const ECONOMY = ["balance","bal","wallet","bank","deposit","withdraw","transfer","leaderboard"];
const BANK = ["bankinfo","banklevel","bankupgrade","bankrob","banklock","interest","loan","repay"];
const INVENTORY = ["inventory","inv","use","drop","give","craft","items","equip","unequip"];
const SHOP = ["shop","buy","sell","market","price","blackmarket"];
const WORK = ["work","job","jobs","apply","quitjob","salary","overtime","promotion"];
const CRIME = ["crime","steal","rob","scam","hack","fraud","escape","jail","bail"];
const DAILY = ["daily","weekly","monthly","streak","bonus","claim"];
const LEVEL = ["level","xp","rank","prestige","skills","achievements"];
const FIGHT = ["stats","fight","duel","hp","heal","attack","defend","weapons"];
const LOOT = ["loot","open","boxes","rare","legendary"];
const CLAN = ["clan","clancreate","claninvite","clankick","claninfo","clanbank","clanwar","gang"];
const GAMES = ["coinflip","dice","slot","casino","bet","jackpot","roulette"];
const FUN = ["roast","respect","sus","mid","hug","slap","punch","kiss","compliment","love"];
const MEME = ["meme","vibecheck","aura","energy","mood"];
const RATINGS = ["iq","coolrate","gayrate","simp","sigma","toxicrate","sadrate"];
const SYSTEM = ["settings","profile","profileedit","privacy","notifications","language","setprefix"];
const MUSIC = ["play","music","audio","song"];

const ALL = [
  ...BASIC,...GROUP,...MOD,...OWNER_CMDS,...ECONOMY,...BANK,
  ...INVENTORY,...SHOP,...WORK,...CRIME,...DAILY,...LEVEL,
  ...FIGHT,...LOOT,...CLAN,...GAMES,...FUN,...MEME,...RATINGS,...SYSTEM,...MUSIC
];

// Load external command files from ./commands and merge their names
const CMD_MAP = new Map();
try {
  const cmdFiles = fs.existsSync('./commands') ? fs.readdirSync('./commands').filter(f => f.endsWith('.js')) : [];
  for (const file of cmdFiles) {
    try {
      const cmds = require(`./commands/${file}`);
      if (Array.isArray(cmds)) {
        cmds.forEach(c => {
          if (c && c.name) {
            CMD_MAP.set(c.name, c);
            if (!ALL.includes(c.name)) ALL.push(c.name);
          }
        });
      }
    } catch (e) {
      console.log('⚠️ Fehler beim Laden von', file, e.message);
    }
  }
  if (CMD_MAP.size > 0) console.log(`✅ Geladene externe Commands: ${CMD_MAP.size}`);
} catch (e) {
  console.log('ℹ️ Keine externen Commands geladen');
}

// ===== BOT =====
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    defaultQueryTimeoutMs: 20000,
    browser: ['Ubuntu', 'Chrome', '120.0.6099.129'],
    logger: require('pino')({ level: 'error' })
  });

  sock.ev.on('creds.update', saveCreds);

  // Update bot uptime every second
  setInterval(() => {
    if (global.botState && global.botState.connected) {
      const uptime = Math.floor((Date.now() - global.botState.startTime.getTime()) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      global.botState.uptime = `${hours}h ${minutes}m`;
    }
  }, 1000);

  sock.ev.on('connection.update', (update) => {
    if(update.qr) {
      console.log('📌 QR-Code zum Scannen:');
      qrcode.generate(update.qr, { small: true });
    }
    if(update.connection==='open') {
      console.log('✅ BOT ONLINE - ~150 COMMANDS GELADEN');
      global.botState.connected = true;
      global.botState.startTime = new Date();
    }
    if(update.connection==='connecting') console.log('🔄 Verbinde...');
    if(update.lastDisconnect && update.lastDisconnect.error) {
      const reason = update.lastDisconnect.error.output?.statusCode;
      const statusCode = update.lastDisconnect.error.output?.statusCode;
      const reconnectDelay = reason === DisconnectReason.loggedOut ? 10000 : 5000;
      
      if(reason === DisconnectReason.loggedOut) {
        console.log('⚠️ Session ausgeloggt - Versuche Neuverbindung mit frischen Credentials (10s)...');
        // Lösche alte Auth-Daten um frische Credentials zu erzeugen
        try {
          const authPath = './auth';
          if(fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
            console.log('🔄 Auth-Daten gelöscht, starte neu...');
          }
        } catch(e) {
          console.log('⚠️ Fehler beim Löschen Auth-Daten:', e.message);
        }
      } else {
        console.log(`⚠️ Verbindung getrennt (Fehlercode: ${statusCode}), reconnect in ${reconnectDelay/1000}s...`);
      }
      
      global.botState.connected = false;
      setTimeout(startBot, reconnectDelay);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;

    // Update global message counter
    global.botState.messagesProcessed++;

    let from = msg.key.remoteJid;
    let sender = msg.key.participant || from;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    const chatId = from;
    const isGroupChat = from && from.endsWith && from.endsWith('@g.us');
    const chatPrefix = getPrefixForChat(chatId) || PREFIX;
    if(!text.startsWith(chatPrefix)) return;

    const args = text.slice(chatPrefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();
    const user = getUser(sender);
    
    // Owner Check - 3 verschiedene Formate akzeptieren
    const isOwner = sender === BOT_OWNER || 
                    sender === BOT_OWNER.replace('@s.whatsapp.net', '') || 
                    sender === OWNER_LID ||
                    sender.includes('1515') || // Fallback für ähnliche Nummern
                    sender.includes('2472489695390'); // LID

    // Helper
    async function send(text) {
      await sock.sendMessage(from, { text });
    }

    // Debug: Owner Status anzeigen bei Owner Commands
    if(OWNER_CMDS.includes(cmd) && !isOwner) {
      return send(`❌ Du bist kein Owner! Du brauchst Owner-Rechte für diesen Command.\n\n👤 Deine ID: ${sender}`);
    }

    // Unbekannte Commands
    if (!ALL.includes(cmd)) {
      return send('❌ Unbekannter Befehl. Tippe /menu für alle Commands!');
    }

    // ===== BASIC COMMANDS =====
    if(cmd === 'ping') return send('🏓 Pong!');
    
    if(cmd === 'uptime') {
      const uptime = Math.floor((Date.now() - START_TIME) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      return send(`⏱️ Bot läuft seit: ${hours}h ${minutes}m ${seconds}s`);
    }

    if(cmd === 'help') {
      return send(`
📖 *HILFE* 📖

Tippe /menu für alle Commands
Es gibt ~150 Commands in verschiedenen Kategorien

💰 Economy - Geld verdienen & managen
🛒 Shop - Items kaufen & verkaufen
⚔️ Fight - Kämpfen mit anderen Spielern
🎮 Games - Spiele & Wetten
😂 Fun - Lustige Commands
🏆 Level - Level & Rank System
👨‍👨‍👧‍👦 Clan - Clan System
🔒 Admin - Moderations-Commands
🔑 Owner - Owner Commands

Tippe z.B. /menu 1 für Economy Commands!`);
    }

    if(cmd === 'menu') {
      const menuNum = args[0] || '0';
      
      if(menuNum === '1') {
        return send(`
💰 *ECONOMY COMMANDS* (1/9)

/balance - Geld anzeigen
/wallet - Geldbörse info
/bank - Bank Info
/deposit <betrag> - Geld einzahlen
/withdraw <betrag> - Geld abheben
/transfer @user <betrag> - Geld senden
/leaderboard - Top Spieler
/daily - Tägliche 500€
/weekly - Wöchentlicher Bonus
/monthly - Monatlicher Bonus

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '2') {
        return send(`
🛒 *SHOP & INVENTORY* (2/9)

/shop - Shop anzeigen
/buy <item> - Item kaufen
/sell <item> - Item verkaufen
/inventory - Inventar anzeigen
/items - Items auflisten
/use <item> - Item benutzen
/equip <item> - Item ausrüsten
/drop <item> - Item fallen lassen
/market - Marktplatz
/price <item> - Preis prüfen
 /lootbox - Lootbox öffnen
 /crate - Kiste öffnen
 /salvage - Item zerlegen
 /upgradeitem - Item verbessern

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '3') {
        return send(`
⚔️ *FIGHT & COMBAT* (3/9)

/fight @user - Mit User kämpfen
/duel @user - Duell starten
/stats - Deine Stats
/hp - Health anzeigen
/heal - Dich selbst heilen
/attack <user> - Angreifen
/defend - Verteidigen
/weapons - Waffen zeigen
/strength - Stärke trainieren

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '4') {
        return send(`
🎮 *GAMES & GAMBLING* (4/9)

/slot <betrag> - Slots spielen
/coinflip <betrag> kopf/zahl - Münzwurf
/dice - Würfeln
/casino - Casino spielen
/roulette - Roulette spielen
/bet <betrag> - Wetten
/jackpot - Jackpot versuchen
/blackjack - Blackjack spielen

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '5') {
        return send(`
😂 *FUN COMMANDS* (5/9)

/roast @user - Verspotte einen User
/compliment @user - Kompliment machen
/love @user - Liebe ausdrücken
/hug @user - Umarmen
/slap @user - Schlagen
/punch @user - Boxen
/kiss @user - Küssen
/respect - Respekt erweisen
/sus @user - Sus Check
/meme - Meme anzeigen

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '6') {
        return send(`
🏆 *LEVEL & XP SYSTEM* (6/9)

/level - Dein Level anzeigen
/xp - XP anzeigen
/rank - Dein Rang
/prestige - Upgrade dein Level
/skills - Skills anzeigen
/achievements - Erfolge anzeigen
/profile - Dein Profil
/stats - Statistiken
 /skillpoints - Freie Skillpunkte anzeigen
 /passives - Passivfähigkeiten anzeigen
 /resetskills - Alle Skills zurücksetzen

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '10') {
        return send(`
 🧭 *ADVENTURE & RPG* (10/10)

 /adventure - Starte ein Abenteuer
 /explore - Erkunde die Welt
 /questlog - Quest Log anzeigen
 /dungeon - Betritt ein Dungeon
 /bossfight - Bosskampf starten

 Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '7') {
        return send(`
👨‍👨‍👧‍👦 *CLAN SYSTEM* (7/9)

/clan - Clan Info
/clancreate <name> - Clan erstellen
/claninvite @user - User einladen
/clankick @user - User rauswurf
/claninfo - Clan Infos
/clanbank - Clan Bank
/clanwar @clan - Clankrieg
/gang - Gang Befehle
/family - Familie Befehle

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '8') {
        return send(`
💼 *WORK & JOBS* (8/9)

/work - Arbeiten
/job - Job Infos
/jobs - Alle Jobs
/apply <job> - Job annehmen
/quitjob - Job kündigen
/salary - Gehalt anzeigen
/overtime - Überstunden
/promotion - Beförderung

Tippe: /menu 0 für andere Kategorien`);
      }

      if(menuNum === '9') {
        if(!isOwner) return send('❌ Du bist kein Owner!');
        return send(`
🔑 *OWNER COMMANDS* (9/9)

/addmoney <betrag> [@user] - Geld geben
/setmoney <betrag> [@user] - Geld setzen
/resetuser @user - User reset
/kick @user - User kicken
/ban @user - User bannen
/unban @user - User entbannen
/promote @user - User promoten
/shutdown - Bot herunterfahren
/settings - Einstellungen
/warnings @user - Verwarnungen

Tippe: /menu 0 für andere Kategorien`);
      }

      // Default Menu
      return send(`
📌 *SUKA SUPREME BOT - HAUPTMENÜ* 📌

🎮 ~150 BEFEHLE VERFÜGBAR!

1️⃣ /menu 1 - 💰 Economy (10 Commands)
2️⃣ /menu 2 - 🛒 Shop & Inventory (10 Commands)
3️⃣ /menu 3 - ⚔️ Fight & Combat (9 Commands)
4️⃣ /menu 4 - 🎮 Games & Gambling (8 Commands)
5️⃣ /menu 5 - 😂 Fun Commands (10 Commands)
6️⃣ /menu 6 - 🏆 Level & XP (8 Commands)
7️⃣ /menu 7 - 👨‍👨‍👧‍👦 Clan System (9 Commands)
8️⃣ /menu 8 - 💼 Work & Jobs (8 Commands)
9️⃣ /menu 9 - 🔑 Owner (nur Owner!)
1️⃣0️⃣ /menu 10 - 🧭 Adventure & RPG

👉 Tippe z.B. "/menu 1" für Details!`);
    }

    // ===== ECONOMY =====
    if(cmd === 'balance' || cmd === 'bal') {
      return send(`💵 *DEIN GELD* 💵\n\n💰 Bargeld: ${user.money}€\n🏦 Bank: ${user.bank}€\n💸 Schulden: ${user.loan}€\n\n📊 Total: ${user.money + user.bank - user.loan}€`);
    }

    if(cmd === 'wallet') {
      return send(`💼 *GELDBÖRSE*\n\nStufe: ${Math.floor(user.money / 1000)}⭐\nRaum: ${user.money}/10000€`);
    }

    if(cmd === 'bank') {
      return send(`🏦 *BANK INFO*\n\nGuthaben: ${user.bank}€\nSchulden: ${user.loan}€\nZinsen: ${Math.floor(user.bank * 0.02)}€/Stunde`);
    }

    if(cmd === 'deposit') {
      const a = Number(args[0]);
      if(isNaN(a) || a <= 0) return send('❌ Gib einen gültigen Betrag an!');
      if(user.money >= a) {
        user.money -= a;
        user.bank += a;
        saveDB();
        return send(`✅ Du hast ${a}€ eingezahlt!\n\nNeu - Bargeld: ${user.money}€ | Bank: ${user.bank}€`);
      }
      return send(`❌ Du hast nicht genug Geld! Du hast nur ${user.money}€`);
    }

    if(cmd === 'withdraw') {
      const a = Number(args[0]);
      if(isNaN(a) || a <= 0) return send('❌ Gib einen gültigen Betrag an!');
      if(user.bank >= a) {
        user.bank -= a;
        user.money += a;
        saveDB();
        return send(`✅ Du hast ${a}€ abgehoben!\n\nNeu - Bargeld: ${user.money}€ | Bank: ${user.bank}€`);
      }
      return send(`❌ Du hast nicht genug auf der Bank! Du hast nur ${user.bank}€`);
    }

    if(cmd === 'leaderboard') {
      const top = Object.entries(db.users)
        .sort((a, b) => (b[1].money + b[1].bank) - (a[1].money + a[1].bank))
        .slice(0, 10)
        .map((u, i) => `${i + 1}. ${u[0].split('@')[0]} - ${u[1].money + u[1].bank}€`)
        .join('\n');
      return send(`🏆 *TOP 10 SPIELER*\n\n${top || 'Noch keine Spieler'}`);
    }

    if(cmd === 'daily') {
      const today = new Date().toDateString();
      if(user.daily.last === today) return send('❌ Du hast deinen Daily bereits erhalten!');
      user.money += 500;
      user.daily.last = today;
      user.daily.streak = (user.daily.streak || 0) + 1;
      saveDB();
      return send(`✅ +500€ Daily Bonus! 🌟\nStreak: ${user.daily.streak}`);
    }

    if(cmd === 'weekly') {
      user.money += 2000;
      saveDB();
      return send(`✅ +2000€ Weekly Bonus! 🎁`);
    }

    if(cmd === 'monthly') {
      user.money += 10000;
      saveDB();
      return send(`✅ +10000€ Monthly Bonus! 🎉`);
    }

    // ===== SHOP =====
    if(cmd === 'shop') {
      return send(`
🛒 *SHOP*

💎 Items zum Kaufen:
- Sword: 500€
- Shield: 400€
- Armor: 1000€
- Potion: 100€
- Gold Bar: 5000€
- Legendary Sword: 10000€

Nutze: /buy <item>`);
    }

    if(cmd === 'buy') {
      const item = args.join(' ');
      const prices = {
        'sword': 500,
        'shield': 400,
        'armor': 1000,
        'potion': 100,
        'gold bar': 5000,
        'legendary sword': 10000
      };
      if(!prices[item.toLowerCase()]) return send('❌ Item nicht im Shop!');
      const price = prices[item.toLowerCase()];
      if(user.money >= price) {
        user.money -= price;
        user.inventory.push(item);
        saveDB();
        return send(`✅ Du hast ${item} für ${price}€ gekauft!\n🎒 Inventar: ${user.inventory.length} Items`);
      }
      return send(`❌ Nicht genug Geld! Du brauchst ${price}€, hast aber nur ${user.money}€`);
    }

    if(cmd === 'inventory' || cmd === 'inv') {
      return send(`🎒 *DEIN INVENTAR*\n\n${user.inventory.length > 0 ? user.inventory.join('\n') : 'Leer'}\n\n📊 Items: ${user.inventory.length}/20`);
    }

    // ===== WORK =====
    if(WORK.includes(cmd)) {
      const earn = Math.floor(Math.random() * 500) + 100;
      user.money += earn;
      user.xp += 5;
      saveDB();
      return send(`💼 Du hast gearbeitet!\n\n✅ +${earn}€\n✨ +5 XP`);
    }

    // ===== CRIME =====
    if(CRIME.includes(cmd)) {
      if(Math.random() > 0.5) {
        const steal = Math.floor(Math.random() * 1000) + 100;
        user.money += steal;
        saveDB();
        return send(`💰 *ERFOLG!* 💰\n\nDu hast ${steal}€ geklaut! 🚨`);
      } else {
        user.jailed = true;
        saveDB();
        return send(`🚔 *ERWISCHT!* 🚔\n\nDu wurdest verhaftet! 🚨\n\nNutze /escape oder /bail`);
      }
    }

    if(cmd === 'escape') {
      if(!user.jailed) return send('❌ Du bist nicht im Jail!');
      if(Math.random() > 0.5) {
        user.jailed = false;
        saveDB();
        return send(`✅ Du bist entkommen! 🚫`);
      }
      return send(`❌ Flucht fehlgeschlagen! Du bleibst im Jail!`);
    }

    if(cmd === 'bail') {
      if(!user.jailed) return send('❌ Du bist nicht im Jail!');
      if(user.money >= 1000) {
        user.money -= 1000;
        user.jailed = false;
        saveDB();
        return send(`✅ Du hast Kaution bezahlt! 💰`);
      }
      return send(`❌ Du brauchst 1000€ für die Kaution!`);
    }

    // ===== FIGHT =====
    if(cmd === 'fight' || cmd === 'duel') {
      const damage = Math.floor(Math.random() * 50) + 10;
      user.health -= damage;
      if(user.health <= 0) {
        user.health = 100;
        saveDB();
        return send(`💥 Du hast gekämpft und VERLOREN!\n\n❌ Deine HP: 0`);
      }
      saveDB();
      return send(`⚔️ Du hast gekämpft!\n\n💥 -${damage} HP\n❤️ Deine HP: ${user.health}`);
    }

    if(cmd === 'heal') {
      user.health = 100;
      saveDB();
      return send(`💖 Du wurdest geheilt! ❤️ 100 HP`);
    }

    if(cmd === 'hp') {
      return send(`❤️ *DEINE GESUNDHEIT*\n\nHP: ${user.health}/100`);
    }

    if(cmd === 'stats') {
      return send(`
📊 *DEINE STATS*

Level: ${user.level}
XP: ${user.xp}
Geld: ${user.money}€
Bank: ${user.bank}€
HP: ${user.health}/100
Waffe: ${user.weapon}
Clan: ${user.clan || 'Kein Clan'}
Job: ${user.job || 'Kein Job'}`);
    }

    // ===== GAMES =====
    if(cmd === 'slot') {
      const bet = Number(args[0]);
      if(isNaN(bet) || bet <= 0 || user.money < bet) return send('❌ Ungültiger Einsatz!');
      const symbols = ['🍒', '🍋', '🍊', '🍉', '💎', '7️⃣'];
      const result = [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
      let win = 0;
      if(result[0] === result[1] && result[1] === result[2]) win = bet * 5;
      user.money -= bet;
      user.money += win;
      saveDB();
      return send(`🎰 ${result.join(' ')}\n${win > 0 ? `✅ Du gewinnst ${win}€! 💰` : '❌ Du verlierst!'}`);
    }

    if(cmd === 'coinflip') {
      const bet = Number(args[0]);
      const choice = args[1] || 'kopf';
      if(isNaN(bet) || user.money < bet) return send('❌ Ungültiger Einsatz!');
      const flip = Math.random() < 0.5 ? 'kopf' : 'zahl';
      let win = 0;
      if(choice.toLowerCase() === flip.toLowerCase()) win = bet * 2;
      user.money -= bet;
      user.money += win;
      saveDB();
      return send(`🪙 ${flip.toUpperCase()}\n${win > 0 ? `✅ Du gewinnst ${win}€!` : '❌ Du verlierst!'}`);
    }

    if(cmd === 'dice') {
      const roll = Math.floor(Math.random() * 6) + 1;
      return send(`🎲 Du würfelst: ${roll}`);
    }

    // ===== FUN =====
    if(cmd === 'roast') {
      const roasts = [
        '🔥 Du siehst aus wie eine Kartoffel!',
        '🔥 Dein IQ ist wie eine Temperatur im Winter!',
        '🔥 Du bist so langweilig, selbst Farben verblassen!',
        '🔥 Wenn blöd schmerzen würde, würdest du schreien!',
        '🔥 Du bist ein Beweis dafür dass Evolution rückwärts laufen kann!'
      ];
      return send(roasts[Math.floor(Math.random() * roasts.length)]);
    }

    if(cmd === 'compliment') {
      const compliments = [
        '💕 Du bist wirklich eine großartige Person!',
        '💕 Dein Lächeln ist wie Sonnenschein!',
        '💕 Du bist intelligenter als die meisten Menschen!',
        '💕 Du hast ein großes Herz!',
        '💕 Dein Stil ist absolut fantastisch!'
      ];
      return send(compliments[Math.floor(Math.random() * compliments.length)]);
    }

    if(cmd === 'hug') return send(`🤗 *UMARMEN* 🤗\n\nDu hast ${args[0] || 'jemandem'} eine warme Umarmung gegeben!`);
    if(cmd === 'slap') return send(`💥 Du schlägt ${args[0] || 'jemandem'}! SLAP!`);
    if(cmd === 'punch') return send(`👊 Du boxst ${args[0] || 'jemandem'}!`);
    if(cmd === 'kiss') return send(`😘 Du küsst ${args[0] || 'jemandem'}!`);
    if(cmd === 'love') return send(`💕 *LOVE* 💕\n\nDu liebst ${args[0] || 'jemanden'}! ❤️`);
    if(cmd === 'respect') return send(`🙏 Du zeigst Respekt! 🙏`);
    if(cmd === 'sus') return send(`📍 Das ist sus... 📍`);

    // ===== LEVEL =====
    if(cmd === 'level') {
      return send(`📊 *DEIN LEVEL*\n\nLevel: ${user.level}\nXP: ${user.xp}\nNächstes Level: ${(user.level + 1) * 100} XP`);
    }

    if(cmd === 'xp') {
      user.xp += 10;
      if(user.xp >= (user.level + 1) * 100) {
        user.level++;
        user.xp = 0;
        saveDB();
        return send(`⭐ *LEVEL UP!* ⭐\n\nDu erreichst Level ${user.level}! 🎉`);
      }
      saveDB();
      return send(`✨ +10 XP\n\nXP: ${user.xp}/${(user.level + 1) * 100}`);
    }

    if(cmd === 'prestige') {
      if(user.level < 50) return send(`❌ Du brauchst Level 50! Du hast Level ${user.level}`);
      user.level = 1;
      user.xp = 0;
      user.money += 50000;
      saveDB();
      return send(`🌟 *PRESTIGE!* 🌟\n\n✨ Level 1 (Prestige)\n💰 +50000€`);
    }

    if(cmd === 'rank') {
      const levels = ['Anfänger', 'Novize', 'Junior', 'Senior', 'Meister', 'Legend', 'Titan', 'Gott'];
      const rankIdx = Math.min(Math.floor(user.level / 10), levels.length - 1);
      return send(`🏆 *DEIN RANG*\n\nLevel: ${user.level}\nRang: ${levels[rankIdx]}`);
    }

    if(cmd === 'profile') {
      return send(`
👤 *PROFIL* 👤

Spieler: ${sender.split('@')[0]}
💰 Geld: ${user.money}€
🏦 Bank: ${user.bank}€
Level: ${user.level}
XP: ${user.xp}
❤️ HP: ${user.health}
🏰 Clan: ${user.clan || 'Keine'}
💼 Job: ${user.job || 'Keinen'}`);
    }

    // ===== CLAN =====
    if(cmd === 'clancreate') {
      const name = args.join(' ');
      if(!name) return send('❌ Syntax: /clancreate <name>');
      user.clan = name;
      saveDB();
      return send(`🏰 Clan "${name}" erstellt!`);
    }

    if(cmd === 'claninfo') {
      return send(`🏰 *CLAN INFO*\n\nClan: ${user.clan || 'Kein Clan'}\nMitglieder: 1\nLevel: 1`);
    }

    if(cmd === 'clan') {
      return send(`🏰 *CLAN SYSTEM*\n\n/clancreate <name> - Clan erstellen\n/claninfo - Clan Info\n/claninvite @user - User einladen\n/clankick @user - User rauswurf\n/clanbank - Clan Bank\n/clanwar <clan> - Clankrieg`);
    }

    // ===== OWNER =====
    if(isOwner) {
      if(cmd === 'addmoney') {
        const amount = Number(args[0]);
        if(isNaN(amount)) return send('❌ Gib einen Betrag an! /addmoney <betrag> [@user]');
        const targetUser = args[1] ? (args[1].replace('@', '')+'@s.whatsapp.net') : sender;
        if(!db.users[targetUser]) db.users[targetUser] = getUser(targetUser);
        db.users[targetUser].money += amount;
        saveDB();
        return send(`✅ ${amount}€ zu ${targetUser.split('@')[0]} hinzugefügt! Neuer Betrag: ${db.users[targetUser].money}€`);
      }

      if(cmd === 'setmoney') {
        const amount = Number(args[0]);
        const targetUser = args[1] ? (args[1].replace('@', '')+'@s.whatsapp.net') : sender;
        if(isNaN(amount)) return send('❌ Gib einen Betrag an! /setmoney <betrag> [@user]');
        if(!db.users[targetUser]) db.users[targetUser] = getUser(targetUser);
        db.users[targetUser].money = amount;
        saveDB();
        return send(`✅ Geld von ${targetUser.split('@')[0]} auf ${amount}€ gesetzt!`);
      }

      if(cmd === 'resetuser') {
        const target = args[0]?.replace('@', '') + '@s.whatsapp.net';
        db.users[target] = {
          money: 1000,
          bank: 0,
          loan: 0,
          inventory: [],
          xp: 0,
          level: 1,
          warnings: 0,
          jailed: false,
          job: null,
          cooldowns: {},
          health: 100,
          weapon: "Fäuste",
          houses: [],
          cars: [],
          clan: null,
          daily: { last: null, streak: 0 }
        };
        saveDB();
        return send(`✅ ${target.split('@')[0]} wurde zurückgesetzt!`);
      }

      if(cmd === 'shutdown') {
        await send('👋 Bot wird heruntergefahren...');
        process.exit(0);
      }

      if(cmd === 'ban') {
        const target = args[0]?.replace('@', '');
        if(!target) return send('❌ Syntax: /ban @user');
        return send(`🚫 ${target} wurde gebannt!`);
      }

      if(cmd === 'unban') {
        const target = args[0]?.replace('@', '');
        if(!target) return send('❌ Syntax: /unban @user');
        return send(`✅ ${target} wurde entbannt!`);
      }
      
    }

    // setprefix command (Owner or group admins)
    if (cmd === 'setprefix') {
      const newPrefix = args[0];
      let isSenderAdmin = false;
      if (isGroupChat) {
        try {
          const metadata = await sock.groupMetadata(chatId);
          const participant = metadata.participants.find(p => p.id === sender);
          isSenderAdmin = !!(participant && (participant.admin || participant.isAdmin || participant.admin === 'admin'));
        } catch {}
      }

      if (!(isOwner || isSenderAdmin)) {
        return send('❌ Du brauchst Owner- oder Gruppen-Admin-Rechte um das Prefix zu ändern.');
      }

      if (!newPrefix) {
        await sock.sendMessage(from, { text: `❗ Usage: ${getPrefixForChat(chatId)}setprefix <prefix|default>` }, { quoted: msg });
        return;
      }

      setPrefixForChat(chatId, newPrefix);
      const cur = getPrefixForChat(chatId);
      await sock.sendMessage(chatId, { text: `✅ Prefix gesetzt auf: ${cur}\nBeispiel: ${cur}ping` }, { quoted: msg });
      return;
    }

    // Default Response
    // Handle external commands loaded from ./commands
    if (CMD_MAP.has(cmd)) {
      try {
        const command = CMD_MAP.get(cmd);
        await command.execute({ sender, args, reply: send, from, sock, db, getUser, user });
        return;
      } catch (e) {
        console.error('❌ Fehler beim Ausführen externen Commands', e);
        return send('❌ Fehler beim Ausführen des Commands');
      }
    }

    return send(`✅ /${cmd} ausgeführt`);
  });

  console.log('🚀 SUKA SUPREME BOT v2.0 - READY!');
}

// Starte Website parallel
if (!websiteStarted) {
  websiteStarted = true;
  console.log('🌐 Starte Website Server...');
  startWebsite();
}

startBot().catch(err => {
  console.error('❌ Bot Fehler:', err);
  process.exit(1);
});
