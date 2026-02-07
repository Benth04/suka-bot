console.log("BOT STARTET JETZT")
// -------------------------
// Suka Supreme Bot v1.0
// Owner: +4915150928935
// -------------------------

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@onedevil405/baileys');
const P = require('pino');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('auth');
const BOT_OWNER = '+4915150928935@s.whatsapp.net'; // Deine Nummer
const DATA_FILE = './user_data.json';

// Lade oder erstelle User-Daten
let userData = {};
if (fs.existsSync(DATA_FILE)) userData = JSON.parse(fs.readFileSync(DATA_FILE));
else fs.writeFileSync(DATA_FILE, JSON.stringify({}));

function saveData() {
fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
}

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
daily: { streak: 0, last: null },
jobs: [],
clans: [],
};
saveData();
}
}

async function sendText(sock, jid, text) {
await sock.sendMessage(jid, { text });
}

function handleCommands(sock, sender, command, args) {
const u = userData[sender];

// ======= Menu =======
if (command === '/menu') {
return sendText(sock, sender, `
📌 *Hauptmenü* 📌
1️⃣ Economy & Inventar 💰🎒
2️⃣ Shop & Autos/Häuser 🚗🏠
3️⃣ Fun & Chaos 😂🎲
4️⃣ Owner 🔑
_Tippe z.B. "/balance" für Economy_`);
}

// ======= Economy =======
if (['/balance','/bal'].includes(command)) {
return sendText(sock, sender, `💵 Geld: ${u.money}€\n🏦 Bank: ${u.bank}€`);
}

if (['/inventory','/inv'].includes(command)) {
return sendText(sock, sender, `
🎒 Inventar:
Items: ${u.items.join(', ') || 'Keine'}
Häuser: ${u.houses.join(', ') || 'Keine'}
Autos: ${u.cars.join(', ') || 'Keine'}
Geld: ${u.money}€
Bank: ${u.bank}€`);
}

if (command === '/deposit') {
const amount = parseInt(args[1]);
if (!amount || amount <= 0) return sendText(sock, sender, '❌ Betrag angeben');
if (u.money < amount) return sendText(sock, sender, '❌ Nicht genug Geld');
u.money -= amount; u.bank += amount; saveData();
return sendText(sock, sender, `✅ ${amount}€ eingezahlt`);
}

if (command === '/withdraw') {
const amount = parseInt(args[1]);
if (!amount || amount <= 0) return sendText(sock, sender, '❌ Betrag angeben');
if (u.bank < amount) return sendText(sock, sender, '❌ Nicht genug Geld auf der Bank');
u.money += amount; u.bank -= amount; saveData();
return sendText(sock, sender, `✅ ${amount}€ abgehoben`);
}

if (command === '/pay') {
const target = args[1]?.replace('@','') + '@s.whatsapp.net';
const amount = parseInt(args[2]);
if (!target || !amount || amount <= 0) return sendText(sock, sender, '❌ Syntax: /pay @user <betrag>');
ensureUser(target);
if (u.money < amount) return sendText(sock, sender, '❌ Nicht genug Geld');
u.money -= amount; userData[target].money += amount; saveData();
return sendText(sock, sender, `✅ Du hast ${amount}€ an ${target.split('@')[0]} geschickt`);
}

// ======= Shop & Autos =======
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

if (command === '/shop') {
let text = '🛒 Shop Items:\n';
for (let k in shopItems) text += `- ${k} ${shopItems[k].emoji} ${shopItems[k].price}€\n`;
text += '\nNutze /buy <item> um zu kaufen';
return sendText(sock, sender, text);
}

if (command === '/buy') {
const itemKey = args[1]?.toLowerCase();
if (!shopItems[itemKey]) return sendText(sock, sender, '❌ Item ungültig');
const item = shopItems[itemKey];
if (u.money < item.price) return sendText(sock, sender, '❌ Nicht genug Geld');
u.money -= item.price;
if(item.type==='house') u.houses.push(itemKey);
else if(item.type==='car') u.cars.push(itemKey);
else u.items.push(itemKey);
saveData();
return sendText(sock, sender, `✅ Du hast ${itemKey} ${item.emoji} gekauft`);
}

// ======= Daily =======
if (command === '/daily') {
const today = new Date().toDateString();
if(u.daily.last === today) return sendText(sock, sender, '❌ Schon heute erhalten');
const amount = 500;
u.money += amount; u.daily.last = today; u.daily.streak = (u.daily.streak||0)+1;
saveData();
return sendText(sock, sender, `✅ Du hast ${amount}€ erhalten 🌟 Streak: ${u.daily.streak}`);
}

// ======= Owner Befehle =======
if(sender===BOT_OWNER){
if(command==='/addmoney'){
const amount=parseInt(args[1]);
const target=args[2]?args[2]+'@s.whatsapp.net':sender;
ensureUser(target);
userData[target].money += amount; saveData();
return sendText(sock,sender,`✅ ${amount}€ wurden ${target===sender?'dir':target} hinzugefügt`);
}
if(command==='/shutdown') process.exit();
}

// ======= Fun & Meme =======
if(command==='/hug'){ return sendText(sock,sender,`🤗 ${sender.split('@')[0]} umarmt ${args[1]||'dir selbst'}`); }
if(command==='/slap'){ return sendText(sock,sender,`💥 ${sender.split('@')[0]} schlägt ${args[1]||'dir selbst'}`); }
if(command==='/meme'){ return sendText(sock,sender,'😂 Hier wäre ein Meme! (Platzhalter)'); }

// ======= Platzhalter für alle anderen Commands =======
const allCommands = [
// Gruppen & Moderation
'/admins','/owner','/tagall','/link','/invite','/report','/warn','/warnings','/clear',
'/mute','/unmute','/lock','/unlock','/slowmode','/antilink','/antispam',
// Bank / Jobs / Crime / Fight / Clan / Games / Fun etc.
'/kick','/promote','/demote','/bot','/reset','/bankinfo','/banklevel','/bankupgrade','/bankrob','/banklock','/interest','/loan','/repay',
'/use','/drop','/give','/craft','/items','/equip','/unequip','/market','/market buy','/market sell','/price','/blackmarket',
'/work','/job','/jobs','/apply','/quitjob','/salary','/overtime','/promotion','/workcooldown',
'/crime','/steal','/rob','/scam','/hack','/fraud','/escape','/jail','/bail',
'/weekly','/monthly','/streak','/bonus','/claim','/cooldowns',
'/level','/xp','/rank','/prestige','/skills','/skillupgrade','/achievements',
'/stats','/fight','/duel','/hp','/heal','/attack','/defend','/weapons',
'/loot','/open','/boxes','/rare','/legendary','/dropchance',
'/clan','/clan create','/clan invite','/clan kick','/clan info','/clan bank','/clan war','/gang','/family',
'/coinflip','/dice','/slot','/casino','/bet','/jackpot',
'/roast','/npc','/clown','/respect','/sus','/mid','/vibecheck','/aura','/energy','/mood','/statusme',
'/iq','/coolrate','/gayrate','/simp','/sigma','/toxicrate',
'/settings','/profile','/profile edit','/privacy','/notifications','/language'
];
if(allCommands.includes(command)){
return sendText(sock,sender,`ℹ️ Befehl "${command}" verfügbar (Platzhalter/Erweiterbar)`);
}
}

function handleCommands(sock, sender, command, args) {
const u = userData[sender];

// ======= Menu =======
if (command === '/menu') {
return sendText(sock, sender, `
📌 *Hauptmenü* 📌
1️⃣ Economy & Inventar 💰🎒
2️⃣ Shop & Autos/Häuser 🚗🏠
3️⃣ Fun & Chaos 😂🎲
4️⃣ Owner 🔑
_Tippe z.B. "/balance" für Economy_`);
}

// ======= Economy =======
if (['/balance','/bal'].includes(command)) {
return sendText(sock, sender, `💵 Geld: ${u.money}€\n🏦 Bank: ${u.bank}€`);
}

if (['/inventory','/inv'].includes(command)) {
return sendText(sock, sender, `
🎒 Inventar:
Items: ${u.items.join(', ') || 'Keine'}
Häuser: ${u.houses.join(', ') || 'Keine'}
Autos: ${u.cars.join(', ') || 'Keine'}
Geld: ${u.money}€
Bank: ${u.bank}€`);
}

if (command === '/deposit') {
const amount = parseInt(args[1]);
if (!amount || amount <= 0) return sendText(sock, sender, '❌ Betrag angeben');
if (u.money < amount) return sendText(sock, sender, '❌ Nicht genug Geld');
u.money -= amount; u.bank += amount; saveData();
return sendText(sock, sender, `✅ ${amount}€ eingezahlt`);
}

if (command === '/withdraw') {
const amount = parseInt(args[1]);
if (!amount || amount <= 0) return sendText(sock, sender, '❌ Betrag angeben');
if (u.bank < amount) return sendText(sock, sender, '❌ Nicht genug Geld auf der Bank');
u.money += amount; u.bank -= amount; saveData();
return sendText(sock, sender, `✅ ${amount}€ abgehoben`);
}

if (command === '/pay') {
const target = args[1]?.replace('@','') + '@s.whatsapp.net';
const amount = parseInt(args[2]);
if (!target || !amount || amount <= 0) return sendText(sock, sender, '❌ Syntax: /pay @user <betrag>');
ensureUser(target);
if (u.money < amount) return sendText(sock, sender, '❌ Nicht genug Geld');
u.money -= amount; userData[target].money += amount; saveData();
return sendText(sock, sender, `✅ Du hast ${amount}€ an ${target.split('@')[0]} geschickt`);
}

// ======= Shop & Autos =======
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

if (command === '/shop') {
let text = '🛒 Shop Items:\n';
for (let k in shopItems) text += `- ${k} ${shopItems[k].emoji} ${shopItems[k].price}€\n`;
text += '\nNutze /buy <item> um zu kaufen';
return sendText(sock, sender, text);
}

if (command === '/buy') {
const itemKey = args[1]?.toLowerCase();
if (!shopItems[itemKey]) return sendText(sock, sender, '❌ Item ungültig');
const item = shopItems[itemKey];
if (u.money < item.price) return sendText(sock, sender, '❌ Nicht genug Geld');
u.money -= item.price;
if(item.type==='house') u.houses.push(itemKey);
else if(item.type==='car') u.cars.push(itemKey);
else u.items.push(itemKey);
saveData();
return sendText(sock, sender, `✅ Du hast ${itemKey} ${item.emoji} gekauft`);
}

// ======= Daily =======
if (command === '/daily') {
const today = new Date().toDateString();
if(u.daily.last === today) return sendText(sock, sender, '❌ Schon heute erhalten');
const amount = 500;
u.money += amount; u.daily.last = today; u.daily.streak = (u.daily.streak||0)+1;
saveData();
return sendText(sock, sender, `✅ Du hast ${amount}€ erhalten 🌟 Streak: ${u.daily.streak}`);
}

// ======= Owner Befehle =======
if(sender===BOT_OWNER){
if(command==='/addmoney'){
const amount=parseInt(args[1]);
const target=args[2]?args[2]+'@s.whatsapp.net':sender;
ensureUser(target);
userData[target].money += amount; saveData();
return sendText(sock,sender,`✅ ${amount}€ wurden ${target===sender?'dir':target} hinzugefügt`);
}
if(command==='/shutdown') process.exit();
}

// ======= Fun & Meme =======
if(command==='/hug'){ return sendText(sock,sender,`🤗 ${sender.split('@')[0]} umarmt ${args[1]||'dir selbst'}`); }
if(command==='/slap'){ return sendText(sock,sender,`💥 ${sender.split('@')[0]} schlägt ${args[1]||'dir selbst'}`); }
if(command==='/meme'){ return sendText(sock,sender,'😂 Hier wäre ein Meme! (Platzhalter)'); }

// ======= Platzhalter für alle anderen Commands =======
const allCommands = [
// Gruppen & Moderation
'/admins','/owner','/tagall','/link','/invite','/report','/warn','/warnings','/clear',
'/mute','/unmute','/lock','/unlock','/slowmode','/antilink','/antispam',
// Bank / Jobs / Crime / Fight / Clan / Games / Fun etc.
'/kick','/promote','/demote','/bot','/reset','/bankinfo','/banklevel','/bankupgrade','/bankrob','/banklock','/interest','/loan','/repay',
'/use','/drop','/give','/craft','/items','/equip','/unequip','/market','/market buy','/market sell','/price','/blackmarket',
'/work','/job','/jobs','/apply','/quitjob','/salary','/overtime','/promotion','/workcooldown',
'/crime','/steal','/rob','/scam','/hack','/fraud','/escape','/jail','/bail',
'/weekly','/monthly','/streak','/bonus','/claim','/cooldowns',
'/level','/xp','/rank','/prestige','/skills','/skillupgrade','/achievements',
'/stats','/fight','/duel','/hp','/heal','/attack','/defend','/weapons',
'/loot','/open','/boxes','/rare','/legendary','/dropchance',
'/clan','/clan create','/clan invite','/clan kick','/clan info','/clan bank','/clan war','/gang','/family',
'/coinflip','/dice','/slot','/casino','/bet','/jackpot',
'/roast','/npc','/clown','/respect','/sus','/mid','/vibecheck','/aura','/energy','/mood','/statusme',
'/iq','/coolrate','/gayrate','/simp','/sigma','/toxicrate',
'/settings','/profile','/profile edit','/privacy','/notifications','/language'
];
if(allCommands.includes(command)){
return sendText(sock,sender,`ℹ️ Befehl "${command}" verfügbar (Platzhalter/Erweiterbar)`);
}
}
// ======= Jobs & Work =======
if(['/work','/job'].includes(command)){
if(u.jobs.length===0) return sendText(sock,sender,'❌ Du hast keinen Job. /apply <job> um zu bewerben');
const salary = Math.floor(Math.random()*(500-100)+100); // zufälliges Gehalt
u.money += salary; saveData();
return sendText(sock,sender,`💼 Du hast gearbeitet und ${salary}€ verdient!`);
}
if(command==='/apply'){
const job = args[1]; if(!job) return sendText(sock,sender,'❌ Syntax: /apply <job>');
if(u.jobs.includes(job)) return sendText(sock,sender,'❌ Du hast diesen Job bereits');
u.jobs.push(job); saveData();
return sendText(sock,sender,`✅ Du wurdest als ${job} eingestellt`);
}
if(command==='/quitjob'){
const job=args[1]; if(!job || !u.jobs.includes(job)) return sendText(sock,sender,'❌ Job nicht gefunden');
u.jobs=u.jobs.filter(j=>j!==job); saveData();
return sendText(sock,sender,`✅ Du hast den Job ${job} gekündigt`);
}
if(command==='/salary'){
const total=u.jobs.length*100; u.money+=total; saveData();
return sendText(sock,sender,`💵 Du hast ${total}€ Gehalt erhalten für ${u.jobs.length} Job(s)`);
}

// ======= Crime / Risk =======
if(command==='/rob'){
const target=args[1]?.replace('@','')+'@s.whatsapp.net';
if(!target || !userData[target]) return sendText(sock,sender,'❌ Ziel nicht gefunden');
const chance=Math.random();
if(chance>0.5){
const amount=Math.floor(Math.random()*(u.money/2+100));
u.money+=amount; userData[target].money-=amount; saveData();
return sendText(sock,sender,`💰 Du hast ${amount}€ von ${target.split('@')[0]} geraubt`);
} else {
return sendText(sock,sender,'❌ Du wurdest erwischt und musst 1 Runde aussetzen');
}
}

if(command==='/steal'){
const target=args[1]?.replace('@','')+'@s.whatsapp.net';
if(!target || !userData[target]) return sendText(sock,sender,'❌ Ziel nicht gefunden');
const chance=Math.random();
if(chance>0.6){
const item=userData[target].items.pop();
if(!item) return sendText(sock,sender,'❌ Ziel hat keine Items');
u.items.push(item); saveData();
return sendText(sock,sender,`🛒 Du hast ${item} von ${target.split('@')[0]} gestohlen`);
} else return sendText(sock,sender,'❌ Gestohlen fehlgeschlagen');
}

if(command==='/jail'){
u.jail=true; saveData();
return sendText(sock,sender,'🚨 Du bist im Jail, warte 1 Minute oder nutze /escape');

// Escape
} if(command==='/escape'){
if(!u.jail) return sendText(sock,sender,'❌ Du bist nicht im Jail');
const chance=Math.random();
if(chance>0.5){ u.jail=false; saveData(); return sendText(sock,sender,'✅ Du bist entkommen!'); }
else return sendText(sock,sender,'❌ Flucht fehlgeschlagen, bleib im Jail');
}

// ======= Fight / Duel =======
if(command==='/fight'){
const target=args[1]?.replace('@','')+'@s.whatsapp.net';
if(!target || !userData[target]) return sendText(sock,sender,'❌ Ziel nicht gefunden');
const damage=Math.floor(Math.random()*50)+10;
const targetUser=userData[target];
targetUser.hp=targetUser.hp||100;
targetUser.hp-=damage;
if(targetUser.hp<=0){ targetUser.hp=100; saveData(); return sendText(sock,sender,`💥 Du hast ${target.split('@')[0]} besiegt!`);}
saveData();
return sendText(sock,sender,`⚔️ Du hast ${target.split('@')[0]} ${damage} HP Schaden zugefügt!`);
}
if(command==='/heal'){ u.hp=100; saveData(); return sendText(sock,sender,'💖 Du wurdest geheilt'); }

// ======= Casino / Games =======
if(command==='/slot'){
const bet=parseInt(args[1]);
if(!bet || bet>u.money) return sendText(sock,sender,'❌ Ungültiger Einsatz');
const symbols=['🍒','🍋','🍊','🍉','💎','7️⃣'];
const result=[symbols[Math.floor(Math.random()*symbols.length)],symbols[Math.floor(Math.random()*symbols.length)],symbols[Math.floor(Math.random()*symbols.length)]];
let win=0; if(result[0]===result[1]&&result[1]===result[2]) win=bet*5;
u.money-=bet; u.money+=win; saveData();
return sendText(sock,sender,`🎰 ${result.join(' ')}\n${win>0?'✅ Du hast '+win+'€ gewonnen':'❌ Du hast verloren'}`);
}

if(command==='/coinflip'){
const bet=parseInt(args[1]); if(!bet || bet>u.money) return sendText(sock,sender,'❌ Ungültiger Einsatz');
const flip=Math.random()<0.5?'Kopf':'Zahl'; const choice=args[2]||'Kopf';
let win=0; if(choice.toLowerCase()===flip.toLowerCase()) win=bet*2;
u.money-=bet; u.money+=win; saveData();
return sendText(sock,sender,`🪙 Ergebnis: ${flip}\n${win>0?'✅ Du hast '+win+'€ gewonnen':'❌ Du hast verloren'}`);
}

// ======= Loot / Boxes =======
if(command==='/loot' || command==='/open'){
const items=['💎 Diamant','🌿 Cannabis','👕 Luxusshirt','🚗 Auto','🏠 Haus','⌚ Uhr'];
const found=items[Math.floor(Math.random()*items.length)];
u.items.push(found); saveData();
return sendText(sock,sender,`🎁 Du hast erhalten: ${found}`);
}

// ======= Clan =======
if(command==='/clan create'){
const name=args[1]; if(!name) return sendText(sock,sender,'❌ Syntax: /clan create <name>');
u.clans.push(name); saveData();
return sendText(sock,sender,`🏰 Clan ${name} erstellt`);
}
if(command==='/clan invite'){
const target=args[1]?.replace('@','')+'@s.whatsapp.net'; const clan=args[2];
if(!target||!clan||!u.clans.includes(clan)) return sendText(sock,sender,'❌ Syntax: /clan invite @user <clan>');
ensureUser(target); userData[target].clans.push(clan); saveData();
return sendText(sock,sender,`✅ ${target.split('@')[0]} wurde eingeladen`);
}
if(command==='/clan war'){
const targetClan=args[1]; if(!targetClan) return sendText(sock,sender,'❌ Syntax: /clan war <clan>');
return sendText(sock,sender,`⚔️ Clankrieg gegen ${targetClan} gestartet!`);
}


startBot()
