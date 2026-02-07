console.log("BOT STARTET JETZT");
// -------------------------
// Suka Supreme Bot v1.0
// Owner: +4915150928935
// -------------------------

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@onedevil405/baileys');
const fs = require('fs');

const BOT_OWNER = '+4915150928935@s.whatsapp.net';
const DATA_FILE = './user_data.json';
const SESSION_FILE = './auth';

// Lade oder erstelle User-Daten
let userData = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : {};
function saveData() { fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2)); }

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

async function startBot() {
    // Auth
    const { state, saveCreds } = await useSingleFileAuthState(SESSION_FILE);

    const sock = makeWASocket({
        auth: state,
        connectTimeoutMs: 30000
    });

    sock.ev.on('creds.update', saveCreds);

    // Connection Updates
    sock.ev.on('connection.update', (update) => {
        if(update.connection==='open') console.log('✅ Bot läuft...');
        if(update.lastDisconnect && update.lastDisconnect.error) {
            console.log('⚠️ Verbindung getrennt:', update.lastDisconnect.error);
        }
    });

    // Helper
    async function sendText(jid, text) {
        await sock.sendMessage(jid, { text });
    }

    // Event für Nachrichten
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if(!msg.message || msg.key.fromMe) return;
        const sender = msg.key.remoteJid;
        ensureUser(sender);

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if(!text) return;
        const args = text.trim().split(/ +/);
        const command = args[0].toLowerCase();

        handleCommands(sock, sender, command, args);
    });

    // ===== Commands =====
    function handleCommands(sock, sender, command, args){
        const u = userData[sender];

        // ===== Menu =====
        if(command==='/menu'){
            return sendText(sender, `
📌 *Hauptmenü* 📌
1️⃣ Economy & Inventar 💰🎒
2️⃣ Shop & Autos/Häuser 🚗🏠
3️⃣ Fun & Chaos 😂🎲
4️⃣ Owner 🔑
_Tippe z.B. "/balance" für Economy_`);
        }

        // ===== Economy =====
        if(['/balance','/bal'].includes(command)){
            return sendText(sender, `💵 Geld: ${u.money}€\n🏦 Bank: ${u.bank}€`);
        }

        if(['/inventory','/inv'].includes(command)){
            return sendText(sender, `
🎒 Inventar:
Items: ${u.items.join(', ') || 'Keine'}
Häuser: ${u.houses.join(', ') || 'Keine'}
Autos: ${u.cars.join(', ') || 'Keine'}
Geld: ${u.money}€
Bank: ${u.bank}€`);
        }

        if(command==='/deposit'){
            const amount=parseInt(args[1]);
            if(!amount || amount<=0) return sendText(sender,'❌ Betrag angeben');
            if(u.money<amount) return sendText(sender,'❌ Nicht genug Geld');
            u.money-=amount; u.bank+=amount; saveData();
            return sendText(sender, `✅ ${amount}€ eingezahlt`);
        }

        if(command==='/withdraw'){
            const amount=parseInt(args[1]);
            if(!amount || amount<=0) return sendText(sender,'❌ Betrag angeben');
            if(u.bank<amount) return sendText(sender,'❌ Nicht genug Geld auf der Bank');
            u.money+=amount; u.bank-=amount; saveData();
            return sendText(sender, `✅ ${amount}€ abgehoben`);
        }

        if(command==='/pay'){
            const target = args[1]?.replace('@','')+'@s.whatsapp.net';
            const amount = parseInt(args[2]);
            if(!target || !amount || amount<=0) return sendText(sender,'❌ Syntax: /pay @user <betrag>');
            ensureUser(target);
            if(u.money<amount) return sendText(sender,'❌ Nicht genug Geld');
            u.money-=amount; userData[target].money+=amount; saveData();
            return sendText(sender, `✅ Du hast ${amount}€ an ${target.split('@')[0]} geschickt`);
        }

        // ===== Shop =====
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
            let text='🛒 Shop Items:\n';
            for(let k in shopItems) text+=`- ${k} ${shopItems[k].emoji} ${shopItems[k].price}€\n`;
            text+='\nNutze /buy <item> um zu kaufen';
            return sendText(sender,text);
        }

        if(command==='/buy'){
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
            const today=new Date().toDateString();
            if(u.daily.last===today) return sendText(sender,'❌ Schon heute erhalten');
            const amount=500; u.money+=amount; u.daily.last=today; u.daily.streak=(u.daily.streak||0)+1; saveData();
            return sendText(sender, `✅ Du hast ${amount}€ erhalten 🌟 Streak: ${u.daily.streak}`);
        }

        // ===== Fun =====
        if(command==='/hug') return sendText(sender, `🤗 ${sender.split('@')[0]} umarmt ${args[1]||'dir selbst'}`);
        if(command==='/slap') return sendText(sender, `💥 ${sender.split('@')[0]} schlägt ${args[1]||'dir selbst'}`);
        if(command==='/meme') return sendText(sender,'😂 Hier wäre ein Meme! (Platzhalter)');

        // ===== Owner =====
        if(sender===BOT_OWNER){
            if(command==='/addmoney'){
                const amount=parseInt(args[1]);
                const target=args[2]?args[2]+'@s.whatsapp.net':sender;
                ensureUser(target); userData[target].money+=amount; saveData();
                return sendText(sender, `✅ ${amount}€ wurden ${target===sender?'dir':target} hinzugefügt`);
            }
            if(command==='/shutdown') process.exit();
        }

        // ===== Jobs =====
        if(['/work','/job'].includes(command)){
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

        // ===== Crime =====
        if(command==='/rob'){
            const target=args[1]?.replace('@','')+'@s.whatsapp.net';
            if(!target || !userData[target]) return sendText(sender,'❌ Ziel nicht gefunden');
            if(Math.random()>0.5){
                const amount=Math.floor(Math.random()*(u.money/2+100));
                u.money+=amount; userData[target].money-=amount; saveData();
                return sendText(sender, `💰 Du hast ${amount}€ von ${target.split('@')[0]} geraubt`);
            } else return sendText(sender,'❌ Du wurdest erwischt und musst 1 Runde aussetzen');
        }

        if(command==='/loot'||command==='/open'){
            const items=['💎 Diamant','🌿 Cannabis','👕 Luxusshirt','🚗 Auto','🏠 Haus','⌚ Uhr'];
            const found=items[Math.floor(Math.random()*items.length)];
            u.items.push(found); saveData();
            return sendText(sender, `🎁 Du hast erhalten: ${found}`);
        }

        // ===== Clan =====
        if(command==='/clan create'){
            const name=args[1]; if(!name) return sendText(sender,'❌ Syntax: /clan create <name>');
            u.clans.push(name); saveData();
            return sendText(sender, `🏰 Clan ${name} erstellt`);
        }
        if(command==='/clan invite'){
            const target=args[1]?.replace('@','')+'@s.whatsapp.net';
            const clan=args[2]; if(!target||!clan||!u.clans.includes(clan)) return sendText(sender,'❌ Syntax: /clan invite @user <clan>');
            ensureUser(target); userData[target].clans.push(clan); saveData();
            return sendText(sender, `✅ ${target.split('@')[0]} wurde eingeladen`);
        }
    }

}

startBot();
