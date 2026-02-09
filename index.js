console.log("BOT STARTET JETZT");
// -------------------------
// Suka Supreme Bot v1.0
// Owner: +49 1515 0928935
// -------------------------

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { startWebsite } = require('./website');

const BOT_OWNER = '+49 1515 0928935@s.whatsapp.net';
const OWNER_LID = '2472489695390@lid';
const DATA_FILE = './user_data.json';
const CONFIG_FILE = './config.json';

// Website nur einmal starten
let websiteStarted = false;

// Lade Config
let config = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE)) : {};

// Lade oder erstelle User-Daten
let userData = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : {};
function saveData() { fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2)); }
function saveConfig() { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); }

// Bot State für Website
let botState = {
    connected: false,
    startTime: new Date(),
    messagesProcessed: 0,
    uptime: '0h 0m'
};

function updateUptime() {
    const now = new Date();
    const diff = now - botState.startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    botState.uptime = `${hours}h ${minutes}m`;
}
setInterval(updateUptime, 60000);

function ensureUser(sender) {
    if (!userData[sender]) {
        userData[sender] = {
            money: 1000,
            bank: 0,
            inventory: [],
            houses: [],
            cars: [],
            items: [],
            level: 1,
            xp: 0,
            hp: 100,
            daily: { streak: 0, last: null },
            jobs: [],
            clans: [],
            jail: false
        };
        saveData();
    }
}

// Check if user is banned
function isBanned(sender) {
    return config.banned_users && config.banned_users.includes(sender);
}

// Check if command is enabled
function isCommandEnabled(command) {
    const commandMap = {
        '/balance': 'balance',
        '/inventory': 'inventory',
        '/deposit': 'deposit',
        '/withdraw': 'withdraw',
        '/pay': 'pay',
        '/daily': 'daily',
        '/shop': 'shop',
        '/buy': 'buy',
        '/work': 'work',
        '/rob': 'rob',
        '/steal': 'steal',
        '/fight': 'fight',
        '/slot': 'slot',
        '/coinflip': 'coinflip',
        '/jail': 'jail',
        '/clan': 'clan'
    };
    
    const cmd = commandMap[command];
    if (!cmd) return true; // Unknown commands are always allowed
    return config.commands_enabled[cmd] !== false;
}

async function startBot() {
    // Multi-File Auth (auth Ordner)
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

    // Connection Updates
    sock.ev.on('connection.update', (update) => {
        if(update.qr) {
            console.log('📌 QR-Code zum Scannen:');
            qrcode.generate(update.qr, { small: true });
        }
        if(update.connection==='open') {
            console.log('✅ Bot läuft...');
            botState.connected = true;
        }
        if(update.connection==='connecting') console.log('🔄 Verbinde...');
        if(update.lastDisconnect && update.lastDisconnect.error) {
            console.log('⚠️ Verbindung getrennt, reconnect in 5s...');
            botState.connected = false;
            const reason = update.lastDisconnect.error.output?.statusCode;
            if(reason === DisconnectReason.loggedOut) process.exit(0);
            setTimeout(startBot, 5000);
        }
    });

    // Helper
    async function sendText(jid, text) {
        await sock.sendMessage(jid, { text });
    }

    // Nachrichten Event
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if(!msg.message || msg.key.fromMe) return;
        let sender = msg.key.remoteJid;
        // Stelle sicher, dass sender das korrekte Format hat
        if(!sender.includes('@')) sender = sender + '@s.whatsapp.net';
        
        // Check if user is banned
        if(isBanned(sender)) {
            return;
        }
        
        botState.messagesProcessed++;
        ensureUser(sender);

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if(!text) return;
        const args = text.trim().split(/ +/);
        const command = args[0].toLowerCase();

        handleCommands(sock, sender, command, args);
    });

    // Export bot state for website
    global.botState = botState;
    global.userData = userData;
    global.config = config;

    // ===== Commands =====
    async function handleCommands(sock, sender, command, args){
        const u = userData[sender];

        // Helper
        async function send(text) {
            try {
                await sock.sendMessage(sender, { text });
            } catch(e) {
                console.error('Fehler beim Senden:', e.message);
            }
        }

        // ===== Menu =====
        if(command==='/menu'){
            const menuNum = args[1] || '0';
            
            if(menuNum === '1') {
                return send(`
💰 *Economy & Inventar* 💰

/balance - Geld & Bank anzeigen
/inventory - Inventar anzeigen
/deposit <betrag> - Geld einzahlen
/withdraw <betrag> - Geld abheben
/pay @user <betrag> - Geld senden
/daily - Tägliche 500€
/weather <stadt> - Wetter anzeigen
/news - Neuigkeiten anzeigen
/remind <zeit> <nachricht> - Erinnerung setzen
/translate <sprache> <text> - Text übersetzen
/gif <suchbegriff> - GIF suchen
/fact - Zufälligen Fakt anzeigen
/play <songname> - Song abspielen`);
            }
            
            if(menuNum === '2') {
                return send(`
🛒 *Shop & Autos/Häuser* 🛒

/shop - Shop Items anzeigen
/buy <item> - Item kaufen
Items: house, car, bmw_m4, mercedes_c63, yacht, privatejet, cannabis, luxuryshirt, watch`);
            }
            
            if(menuNum === '3') {
                return send(`
😂 *Fun & Chaos* 😂

/hug @user - Umarmen
/slap @user - Schlagen
/meme - Meme anzeigen
/slot <betrag> - Slots spielen
/coinflip <betrag> kopf/zahl - Münzwurf
/fight @user - Kämpfen
/heal - Heilen
/rob @user - Geld rauben
/steal @user - Items stehlen
/jail - Ins Jail gehen
/escape - Aus Jail fliehen
/apply <job> - Job annehmen
/work - Arbeiten
/loot - Loot öffnen
/clan create <name> - Clan erstellen
/clan invite @user <clan> - User einladen
/clan war <clan> - Clankrieg starten`);
            }
            
            if(menuNum === '4') {
                return send(`
🎮 *Gaming Commands* 🎮

/dice - Würfeln
/rps <rock|paper|scissors> - Schere Stein Papier
/leaderboard - Top Spieler anzeigen
/poll <frage> <option1> <option2> ... - Umfrage erstellen
/joke - Witz erzählen
/quote - Motivationszitat`);
            }

            if(menuNum === '5') {
                return send(`
😂 *Neue Fun Commands* 😂

/roast @user - Verspotte einen User
/compliment @user - Komplimente machen
/love @user - Schreib wer du liebst
/music <song> - Musikempfehlung
/avatar - Dein Profil anzeigen
/rank - Dein Rang/Level
/profile [@user] - Detailliertes Profil
/prestige - Upgrade dein Level`);
            }

            if(menuNum === '6') {
                const isOwner = sender === BOT_OWNER || sender === BOT_OWNER.replace('@s.whatsapp.net', '') || sender === OWNER_LID;
                if(!isOwner) return send('❌ Du bist kein Owner!');
                return send(`
🔑 *Owner Commands* 🔑

/addmoney <betrag> [@user] - Geld hinzufügen
/stats - Statistiken anzeigen
/shutdown - Bot herunterfahren
/ban @user - User bannen
/unban @user - User entbannen
/resetuser @user - User zurücksetzen
/broadcast <nachricht> - Nachricht an alle`);
            }
            // Default: Hauptmenü
            return send(`
📌 *Hauptmenü* 📌
1️⃣ Economy & Inventar 💰🎒
2️⃣ Shop & Autos/Häuser 🚗🏠
3️⃣ Fun & Chaos 😂🎲
4️⃣ Gaming 🎮
5️⃣ Neue Fun Commands 🎪
6️⃣ Owner 🔑
_Tippe z.B. "/menu 1" für Details_`);
        }

        // ===== Economy =====
        if(['/balance','/bal'].includes(command)){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            return sendText(sender, `💵 Geld: ${u.money}€\n🏦 Bank: ${u.bank}€`);
        }

        if(['/inventory','/inv'].includes(command)){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            return sendText(sender, `
🎒 Inventar:
Items: ${u.items.join(', ') || 'Keine'}
Häuser: ${u.houses.join(', ') || 'Keine'}
Autos: ${u.cars.join(', ') || 'Keine'}
Geld: ${u.money}€
Bank: ${u.bank}€`);
        }

        if(command==='/lid'){
            let userId = sender.split('@')[0];
            let targetUser = u;
            
            if(args[1]) {
                const target = args[1].replace('@','')+'@s.whatsapp.net';
                if(!userData[target]) return sendText(sender,'❌ User nicht gefunden');
                userId = target.split('@')[0];
                targetUser = userData[target];
            }
            
            return sendText(sender, `
👤 *Profil ID: ${userId}* 👤
Level: ${targetUser.level || 1}
XP: ${targetUser.xp || 0}
HP: ${targetUser.hp || 100}
Jobs: ${targetUser.jobs.length > 0 ? targetUser.jobs.join(', ') : 'Keine'}
Clans: ${targetUser.clans.length > 0 ? targetUser.clans.join(', ') : 'Keine'}
Jail: ${targetUser.jail ? '🚨 Ja' : '✅ Nein'}`);
        }

        if(command==='/deposit'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const amount=parseInt(args[1]);
            if(!amount || amount<=0) return sendText(sender,'❌ Betrag angeben');
            if(u.money<amount) return sendText(sender,'❌ Nicht genug Geld');
            u.money-=amount; u.bank+=amount; saveData();
            return sendText(sender, `✅ ${amount}€ eingezahlt`);
        }

        if(command==='/withdraw'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const amount=parseInt(args[1]);
            if(!amount || amount<=0) return sendText(sender,'❌ Betrag angeben');
            if(u.bank<amount) return sendText(sender,'❌ Nicht genug Geld auf der Bank');
            u.money+=amount; u.bank-=amount; saveData();
            return sendText(sender, `✅ ${amount}€ abgehoben`);
        }

        if(command==='/pay'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const target = args[1]?.replace('@','')+'@s.whatsapp.net';
            const amount = parseInt(args[2]);
            if(!target || !amount || amount<=0) return sendText(sender,'❌ Syntax: /pay @user <betrag>');
            ensureUser(target);
            if(u.money<amount) return sendText(sender,'❌ Nicht genug Geld');
            u.money-=amount; userData[target].money+=amount; saveData();
            return sendText(sender, `✅ Du hast ${amount}€ an ${target.split('@')[0]} geschickt`);
        }

        // ===== Shop & Items =====
        const shopItems = {
            house: { price: 10000, type:'house', emoji:'🏠' },
            car: { price: 5000, type:'car', emoji:'🚗' },
            bmw_m4: { price: 15000, type:'car', emoji:'🚘' },
            mercedes_c63: { price: 18000, type:'car', emoji:'🚘' },
            yacht: { price: 50000, type:'car', emoji:'🛥️' },
            privatejet: { price: 100000, type:'car', emoji:'✈️' },
            cannabis: { price:50, type:'item', emoji:'🌿' },
            luxuryshirt: { price:200, type:'item', emoji:'👕' },
            watch: { price:500, type:'item', emoji:'⌚' }
        };

        if(command==='/shop'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            let text='🛒 Shop Items:\n';
            for(let k in shopItems) text+=`- ${k} ${shopItems[k].emoji} ${shopItems[k].price}€\n`;
            text+='\nNutze /buy <item> um zu kaufen';
            return sendText(sender,text);
        }

        if(command==='/buy'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const itemKey=args[1]?.toLowerCase();
            if(!shopItems[itemKey]) return sendText(sender,'❌ Item ungültig');
            const item=shopItems[itemKey];
            if(u.money<item.price) return sendText(sender,'❌ Nicht genug Geld');
            u.money-=item.price;
            if(item.type==='house') u.houses.push(itemKey);
            else if(item.type==='car') u.cars.push(itemKey);
            else u.items.push(itemKey);
            saveData();
            return sendText(sender, `✅ Du hast ${itemKey} ${item.emoji} gekauft`);
        }

        // ===== Daily =====
        if(command==='/daily'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const today=new Date().toDateString();
            if(u.daily.last===today) return sendText(sender,'❌ Schon heute erhalten');
            const amount=500; u.money+=amount; u.daily.last=today; u.daily.streak=(u.daily.streak||0)+1; saveData();
            return sendText(sender, `✅ Du hast ${amount}€ erhalten 🌟 Streak: ${u.daily.streak}`);
        }

        // ===== Fun & Meme =====
        if(command==='/hug') return sendText(sender, `🤗 ${sender.split('@')[0]} umarmt ${args[1]||'dir selbst'}`);
        if(command==='/slap') return sendText(sender, `💥 ${sender.split('@')[0]} schlägt ${args[1]||'dir selbst'}`);
        if(command==='/meme') return sendText(sender,'😂 Hier wäre ein Meme! (Platzhalter)');

        // ===== Owner =====
        if(isOwner){
            if(command==='/addmoney'){
                const amount=parseInt(args[1]);
                const target=args[2]?args[2]+'@s.whatsapp.net':sender;
                ensureUser(target); userData[target].money+=amount; saveData();
                return sendText(sender, `✅ ${amount}€ wurden ${target===sender?'dir':target.split('@')[0]} hinzugefügt`);
            }
            if(command==='/stats'){
                const userCount = Object.keys(userData).length;
                const totalMoney = Object.values(userData).reduce((sum, user) => sum + user.money, 0);
                const totalBank = Object.values(userData).reduce((sum, user) => sum + user.bank, 0);
                return sendText(sender, `📊 *Bot Statistiken*\n\n👥 User: ${userCount}\n💰 Geld im Umlauf: ${totalMoney}€\n🏦 Geld in Banken: ${totalBank}€\n💵 Total: ${totalMoney + totalBank}€`);
            }
            if(command==='/shutdown') return sendText(sender, '👋 Bot wird heruntergefahren...') && process.exit();
        }

        // ===== Jobs / Work =====
        if(['/work','/job'].includes(command)){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            if(u.jobs.length===0) return sendText(sender,'❌ Du hast keinen Job. /apply <job> um zu bewerben');
            const salary=Math.floor(Math.random()*(500-100)+100);
            u.money+=salary; saveData();
            return sendText(sender, `💼 Du hast gearbeitet und ${salary}€ verdient!`);
        }
        if(command==='/apply'){
            const job=args[1]; if(!job) return sendText(sender,'❌ Syntax: /apply <job>');
            if(u.jobs.includes(job)) return sendText(sender,'❌ Du hast diesen Job bereits');
            u.jobs.push(job); saveData();
            return sendText(sender, `✅ Du wurdest als ${job} eingestellt`);
        }
        if(command==='/quitjob'){
            const job=args[1]; if(!job||!u.jobs.includes(job)) return sendText(sender,'❌ Job nicht gefunden');
            u.jobs=u.jobs.filter(j=>j!==job); saveData();
            return sendText(sender, `✅ Du hast den Job ${job} gekündigt`);
        }

        // ===== Crime / Risk =====
        if(command==='/rob'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const target=args[1]?.replace('@','')+'@s.whatsapp.net';
            if(!target || !userData[target]) return sendText(sender,'❌ Ziel nicht gefunden');
            if(Math.random()>0.5){
                const amount=Math.floor(Math.random()*(u.money/2+100));
                u.money+=amount; userData[target].money-=amount; saveData();
                return sendText(sender, `💰 Du hast ${amount}€ von ${target.split('@')[0]} geraubt`);
            } else return sendText(sender,'❌ Du wurdest erwischt und musst 1 Runde aussetzen');
        }

        if(command==='/steal'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const target=args[1]?.replace('@','')+'@s.whatsapp.net';
            if(!target || !userData[target]) return sendText(sender,'❌ Ziel nicht gefunden');
            if(Math.random()>0.6){
                const item=userData[target].items.pop();
                if(!item) return sendText(sender,'❌ Ziel hat keine Items');
                u.items.push(item); saveData();
                return sendText(sender, `🛒 Du hast ${item} von ${target.split('@')[0]} gestohlen`);
            } else return sendText(sender,'❌ Gestohlen fehlgeschlagen');
        }

        if(command==='/jail'){ u.jail=true; saveData(); return sendText(sender,'🚨 Du bist im Jail, warte 1 Minute oder nutze /escape'); }
        if(command==='/escape'){
            if(!u.jail) return sendText(sender,'❌ Du bist nicht im Jail');
            if(Math.random()>0.5){ u.jail=false; saveData(); return sendText(sender,'✅ Du bist entkommen!'); }
            else return sendText(sender,'❌ Flucht fehlgeschlagen, bleib im Jail');
        }

        // ===== Fight / Duel =====
        if(command==='/fight'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const target=args[1]?.replace('@','')+'@s.whatsapp.net';
            if(!target||!userData[target]) return sendText(sender,'❌ Ziel nicht gefunden');
            const damage=Math.floor(Math.random()*50)+10;
            const targetUser=userData[target];
            targetUser.hp=targetUser.hp||100;
            targetUser.hp-=damage;
            if(targetUser.hp<=0){ targetUser.hp=100; saveData(); return sendText(sender, `💥 Du hast ${target.split('@')[0]} besiegt!`); }
            saveData();
            return sendText(sender, `⚔️ Du hast ${target.split('@')[0]} ${damage} HP Schaden zugefügt!`);
        }
        if(command==='/heal'){ u.hp=100; saveData(); return sendText(sender,'💖 Du wurdest geheilt'); }

        // ===== Casino / Games =====
        if(command==='/slot'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const bet=parseInt(args[1]); if(!bet||bet>u.money) return sendText(sender,'❌ Ungültiger Einsatz');
            const symbols=['🍒','🍋','🍊','🍉','💎','7️⃣'];
            const result=[symbols[Math.floor(Math.random()*symbols.length)],symbols[Math.floor(Math.random()*symbols.length)],symbols[Math.floor(Math.random()*symbols.length)]];
            let win=0; if(result[0]===result[1]&&result[1]===result[2]) win=bet*5;
            u.money-=bet; u.money+=win; saveData();
            return sendText(sender, `🎰 ${result.join(' ')}\n${win>0?'✅ Du hast '+win+'€ gewonnen':'❌ Du hast verloren'}`);
        }
        if(command==='/coinflip'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const bet=parseInt(args[1]); if(!bet||bet>u.money) return sendText(sender,'❌ Ungültiger Einsatz');
            const flip=Math.random()<0.5?'Kopf':'Zahl'; const choice=args[2]||'Kopf';
            let win=0; if(choice.toLowerCase()===flip.toLowerCase()) win=bet*2;
            u.money-=bet; u.money+=win; saveData();
            return sendText(sender, `🪙 Ergebnis: ${flip}\n${win>0?'✅ Du hast '+win+'€ gewonnen':'❌ Du hast verloren'}`);
        }

        // ===== Loot / Boxes =====
        if(command==='/loot'||command==='/open'){
            const items=['💎 Diamant','🌿 Cannabis','👕 Luxusshirt','🚗 Auto','🏠 Haus','⌚ Uhr'];
            const found=items[Math.floor(Math.random()*items.length)];
            u.items.push(found); saveData();
            return sendText(sender, `🎁 Du hast erhalten: ${found}`);
        }

        // ===== Clan =====
        if(command==='/clan create'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const name=args[1]; if(!name) return sendText(sender,'❌ Syntax: /clan create <name>');
            u.clans.push(name); saveData();
            return sendText(sender, `🏰 Clan ${name} erstellt`);
        }
        if(command==='/clan invite'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const target=args[1]?.replace('@','')+'@s.whatsapp.net';
            const clan=args[2]; if(!target||!clan||!u.clans.includes(clan)) return sendText(sender,'❌ Syntax: /clan invite @user <clan>');
            ensureUser(target); userData[target].clans.push(clan); saveData();
            return sendText(sender, `✅ ${target.split('@')[0]} wurde eingeladen`);
        }
        if(command==='/clan war'){
            if(!isCommandEnabled(command)) return send('❌ Dieser Command ist deaktiviert');
            const targetClan=args[1]; if(!targetClan) return sendText(sender,'❌ Syntax: /clan war <clan>');
            return sendText(sender, `⚔️ Clankrieg gegen ${targetClan} gestartet!`);
        }

        // ===== Gaming =====
        if(command==='/dice'){
            const roll = Math.floor(Math.random() * 6) + 1;
            return sendText(sender, `🎲 Du würfelst: ${roll}`);
        }

        if(command==='/rps'){
            const raw = (args[1] || '').toLowerCase();
            const map = { stein: 'rock', papier: 'paper', schere: 'scissors' };
            const choice = map[raw] || raw;
            const opts = ['rock','paper','scissors'];
            if(!opts.includes(choice)) return sendText(sender, '❌ Nutze: /rps <rock|paper|scissors> (oder deutsch: stein/papier/schere)');
            const botPick = opts[Math.floor(Math.random()*3)];
            let result = 'Unentschieden';
            if((choice==='rock'&&botPick==='scissors')||(choice==='paper'&&botPick==='rock')||(choice==='scissors'&&botPick==='paper')) result='✅ Du gewinnst!';
            else if(choice!==botPick) result='❌ Du verlierst!';
            return sendText(sender, `🕹️ Du: ${choice}\nBot: ${botPick}\n${result}`);
        }

        if(command==='/leaderboard'){
            const top = Object.entries(userData).sort((a,b)=>b[1].money - a[1].money).slice(0,5)
                .map(([k,v],i) => `${i+1}. ${k.split('@')[0]} — ${v.money}€`).join('\n');
            return sendText(sender, `🏆 Top Spieler:\n${top || 'Noch keine Spieler'}`);
        }

        if(command === '/poll') {
            const question = args[1];
            const options = args.slice(2);
            createPoll(sender, question, options);
            return sendText(sender, `📊 Umfrage erstellt: ${question}\nOptionen: ${options.join(', ')}`);
        }

        if(command === '/joke') {
            const joke = await getRandomJoke();
            return sendText(sender, `😂 Witz: ${joke}`);
       }

        if(command === '/quote') {
            const quote = await getMotivationalQuote();
            return sendText(sender, `💬 Zitat: ${quote}`);
        }

        if(command === '/weather') {
            const city = args[1];
            if (!city) return sendText(sender, '❌ Bitte gib eine Stadt an.');
            const weather = await getWeather(city);
            return sendText(sender, `🌤️ Wetter in ${city}: ${weather}`);
        }

        if(command === '/news') {
            const news = await fetchLatestNews();
            return sendText(sender, `📰 Neuigkeiten: ${news}`);
        }

        if(command === '/remind') {
            const time = args[1];
            const message = args.slice(2).join(' ');
            setReminder(sender, time, message);
            return sendText(sender, `⏰ Erinnerung gesetzt für ${time}: ${message}`);
        }

        if(command === '/translate') {
            const language = args[1];
            const text = args.slice(2).join(' ');
            const translatedText = await translateText(language, text);
            return sendText(sender, `🌐 Übersetzung: ${translatedText}`);
        }

        if(command === '/gif') {
            const searchTerm = args[1];
            const gifUrl = await fetchGif(searchTerm);
            return sendText(sender, gifUrl);
        }

        if(command === '/fact') {
            const fact = await getRandomFact();
            return sendText(sender, `🔍 Fakt: ${fact}`);
        }

        if(command === '/play') {
            const songName = args.slice(1).join(' ');
            if(!songName) return send('❌ Bitte gib einen Song Namen ein. /play <songname>');
            
            // Sammlung von Streaming-Links und Songs
            const songs = {
                'bohemian rhapsody': 'https://youtu.be/fJ9rUzIMt7o',
                'shape of you': 'https://youtu.be/JGwWNGJdvx8',
                'blinding lights': 'https://youtu.be/4NRXx6U8ABQ',
                'levitating': 'https://youtu.be/TUVcZfQe-Kw',
                'as it was': 'https://youtu.be/CRXkiMNJqiw',
                'painkiller': 'https://youtu.be/DcHKOC32e4A',
                'starboy': 'https://youtu.be/67KGAqr7010',
                'uptown funk': 'https://youtu.be/OPf0YbXqDm0'
            };
            
            const song = songs[songName.toLowerCase()];
            if(song) {
                return send(`🎵 *Jetzt spiele ich:* ${songName}\n\n▶️ ${song}\n\n🔊 Genießen Sie die Musik! 🎧`);
            } else {
                return send(`🎵 *Song: ${songName}*\n\n▶️ Der Song wird abgespielt...\n🔊 Genieße die Musik! 🎧\n\n💡 _Verfügbare Songs: bohemian rhapsody, shape of you, blinding lights, levitating, as it was, painkiller, starboy, uptown funk_`);
            }
        }

        // ===== NEW FUN COMMANDS =====
        if(command === '/roast') {
            const target = args[1] ? args[1].replace('@', '').split('@')[0] : 'du';
            const roasts = [
                `${target}, du siehst aus wie eine Kartoffel! 🥔`,
                `${target}, dein Verstand ist wie WLAN - kurz außer Reichweite! 📶`,
                `${target}, du bist ein lebendes Beweis dass Evolution rückwärts laufen kann! 🦖`,
                `${target}, du bist so dünn, die TSA denkt du bist Gepäck! ✈️`,
                `${target}, dein Gesicht ist wie die Sonne - ich kann nicht direkt hinschauen! ☀️`
            ];
            return send(roasts[Math.floor(Math.random() * roasts.length)]);
        }

        if(command === '/compliment') {
            const target = args[1] ? args[1].replace('@', '').split('@')[0] : 'du';
            const compliments = [
                `${target}, dein Lächeln ist wie Sonnenschein! ☀️`,
                `${target}, du bist intelligenter als ich dachte! 🧠`,
                `${target}, dein Stil ist absolut fantastisch! 👔`,
                `${target}, du hast ein großes Herz! ❤️`,
                `${target}, du bist eine großartige Person! 🌟`,
                `${target}, deine Witze sind so lustig! 😂`
            ];
            return send(compliments[Math.floor(Math.random() * compliments.length)]);
        }

        if(command === '/love') {
            const target = args[1] ? args[1].replace('@', '').split('@')[0] : 'niemand';
            return send(`💕 *${sender.split('@')[0]} liebt ${target}* 💕\n\n✨ Das ist pure Liebe! ✨`);
        }

        if(command === '/music') {
            const music = args.slice(1).join(' ');
            if(!music) return send('❌ Gib einen Musikgenre oder Song an: /music <genre/song>');
            const genres = {
                'rap': '🎤 Rap ist hart und ehrlich!',
                'pop': '🎵 Pop ist catchy und voll Energie!',
                'rock': '🎸 Rock ist klassisch und episch!',
                'edm': '🎧 EDM ist dein neuer Rhythmus!',
                'hiphop': '🎤 Hip-Hop ist Kultur!',
                'metal': '🤘 Metal bringt Heavy Vibes!',
                'klassik': '🎼 Klassik ist zeitlos elegant!'
            };
            const genre = genres[music.toLowerCase()];
            if(genre) {
                return send(`🎵 *${music}*\n\n${genre}\n\n🔊 Viel Spaß beim Hören! 🎧`);
            } else {
                return send(`🎵 *Musik-Empfehlung: ${music}*\n\n🎧 Das hört sich interessant an!\n\n💡 _Genres: rap, pop, rock, edm, hiphop, metal, klassik_`);
            }
        }

        if(command === '/avatar') {
            const userNum = sender.split('@')[0];
            const avatars = ['😎', '🥸', '👹', '🤡', '👽', '🤖', '👾', '🎭'];
            const avatar = avatars[userNum % avatars.length];
            return send(`${avatar} *Dein Avatar* ${avatar}\n\nDu bist: Nummer ${userNum}\nLevel: ${u.level}\nStatus: 🟢 Online`);
        }

        if(command === '/rank') {
            const levels = ['Anfänger', 'Novize', 'Junior', 'Senior', 'Meister', 'Legend', 'Titan', 'Gott'];
            const rankIndex = Math.min(Math.floor(u.level / 10), levels.length - 1);
            const rank = levels[rankIndex];
            return send(`🏆 *Dein Rang* 🏆\n\nLevel: ${u.level}\nRang: ${rank}\nXP: ${u.xp}\n\n📈 Weiter geht's zum nächsten Rang!`);
        }

        if(command === '/profile') {
            const target = args[1] ? args[1].replace('@', '')+'@s.whatsapp.net' : sender;
            if(!userData[target]) return send('❌ User nicht gefunden');
            const targetData = userData[target];
            const levels = ['Anfänger', 'Novize', 'Junior', 'Senior', 'Meister', 'Legend', 'Titan', 'Gott'];
            const rankIndex = Math.min(Math.floor(targetData.level / 10), levels.length - 1);
            
            return send(`
👤 *PROFIL* 👤

Spieler: ${target.split('@')[0]}
💰 Geld: ${targetData.money}€
🏦 Bank: ${targetData.bank}€
Level: ${targetData.level}
XP: ${targetData.xp}
❤️ HP: ${targetData.hp}
🏆 Rang: ${levels[rankIndex]}
🎒 Items: ${targetData.items.length}
🏠 Häuser: ${targetData.houses.length}
🚗 Autos: ${targetData.cars.length}
📊 Job: ${targetData.jobs.length > 0 ? targetData.jobs.join(', ') : 'Keine'}
🏰 Clan: ${targetData.clans.length > 0 ? targetData.clans.join(', ') : 'Keine'}`);
        }

        if(command === '/prestige') {
            if(u.level < 50) return send(`❌ Du brauchst Level 50 zum Prestige! Du hast: Level ${u.level}`);
            u.level = 1;
            u.xp = 0;
            u.money += 5000;
            saveData();
            return send(`🌟 *PRESTIGE!* 🌟\n\nGlückwunsch! Du hast Level 50 erreicht!\n✨ Dein Level wurde zurückgesetzt auf 1\n💰 Du hast 5000€ als Bonus erhalten!\n\n📈 Starte deine neue Reise!`);
        }

        // ===== OWNER ONLY COMMANDS =====
        const isOwner = sender === BOT_OWNER || sender === BOT_OWNER.replace('@s.whatsapp.net', '') || sender === OWNER_LID;
        
        if(isOwner) {
            if(command === '/ban') {
                const target = args[1]?.replace('@','')+'@s.whatsapp.net';
                if(!target) return send('❌ Syntax: /ban @user');
                if(!config.banned_users) config.banned_users = [];
                if(config.banned_users.includes(target)) return send('❌ User ist bereits gebannt');
                config.banned_users.push(target);
                saveConfig();
                return send(`🚫 ${target.split('@')[0]} wurde gebannt!`);
            }

            if(command === '/unban') {
                const target = args[1]?.replace('@','')+'@s.whatsapp.net';
                if(!target || !config.banned_users) return send('❌ Syntax: /unban @user');
                config.banned_users = config.banned_users.filter(u => u !== target);
                saveConfig();
                return send(`✅ ${target.split('@')[0]} wurde entbannt!`);
            }

            if(command === '/resetuser') {
                const target = args[1]?.replace('@','')+'@s.whatsapp.net';
                if(!target) return send('❌ Syntax: /resetuser @user');
                userData[target] = {
                    money: 1000,
                    bank: 0,
                    inventory: [],
                    houses: [],
                    cars: [],
                    items: [],
                    level: 1,
                    xp: 0,
                    hp: 100,
                    daily: { streak: 0, last: null },
                    jobs: [],
                    clans: [],
                    jail: false
                };
                saveData();
                return send(`🔄 ${target.split('@')[0]} wurde zurückgesetzt!`);
            }

            if(command === '/broadcast') {
                const message = args.slice(1).join(' ');
                if(!message) return send('❌ Syntax: /broadcast <nachricht>');
                return send(`📢 *BROADCAST vom Owner* 📢\n\n${message}\n\n---`);
            }
        }
    }
}

// Starte Bot und Website parallel (nur wenn nicht bereits gestartet)
if (!websiteStarted) {
    websiteStarted = true;
    console.log('🚀 Starte Bot und Website...');
    startWebsite();
}

startBot().catch(err => {
    console.error('❌ Bot Fehler:', err);
    process.exit(1);
});
