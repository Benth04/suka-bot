console.log("BOT STARTET JETZT")
// -------------------------
// Suka Supreme Bot v1.0
// Owner: +4915150928935
// -------------------------

const { default: makeWASocket, useMultiFileAuthState } = require("@onedevil405/baileys")
const fs = require("fs")
const qrcode = require("qrcode-terminal")
const { getUser, loadDB, saveDB } = require("./db")

process.on("uncaughtException", (err) => console.log("❌ UNCAUGHT ERROR:", err))
process.on("unhandledRejection", (err) => console.log("❌ PROMISE ERROR:", err))

const OWNER = ["4915140928935"] // DEINE PRIVATNUMMER

// Shop Items
const shop = {
    cars: [
        { name: "BMW M4", price: 85000, emoji: "🚗" },
        { name: "Mercedes AMG", price: 92000, emoji: "🚙" }
    ],
    houses: [
        { name: "Villa", price: 200000, emoji: "🏠" },
        { name: "Penthouse", price: 350000, emoji: "🏢" }
    ],
    luxury: [
        { name: "Rolex", price: 15000, emoji: "⌚" },
        { name: "Louis Vuitton", price: 5000, emoji: "👜" }
    ],
    drugs: [
        { name: "Cannabis", price: 200, emoji: "🌿" }
    ]
}

// Start Bot
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const sock = makeWASocket({ auth: state })

    // Speichert automatisch die Credentials
    sock.ev.on("creds.update", saveCreds)

    // QR-Code Event
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
            console.log("🔑 QR-Code generieren...")
            qrcode.generate(qr, { small: true })
            console.log("Scanne den QR-Code mit WhatsApp!")
        }
        if (connection === "open") console.log("✅ Bot erfolgreich verbunden!")
        if (connection === "close") console.log("❌ Verbindung geschlossen:", lastDisconnect?.error)
    })

    // Nachrichten-Handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const text = msg.message.conversation || ""
        const sender = msg.key.remoteJid
        const user = getUser(sender)

        // -------------------------
        // BASIC COMMANDS
        // -------------------------
        if (text === "/ping") return sock.sendMessage(sender, { text: "🏓 Pong!" })

        if (text === "/balance") 
            return sock.sendMessage(sender, { text: `💰 Wallet: ${user.money}€\n🏦 Bank: ${user.bank}€` })

        if (text.startsWith("/deposit")) {
            const amt = parseInt(text.split(" ")[1]) || 0
            if (amt > user.money) return sock.sendMessage(sender, { text: "❌ Du hast nicht genug Geld!" })
            user.money -= amt; user.bank += amt; saveDB(loadDB())
            return sock.sendMessage(sender, { text: `✅ ${amt}€ auf die Bank eingezahlt!` })
        }

        if (text.startsWith("/withdraw")) {
            const amt = parseInt(text.split(" ")[1]) || 0
            if (amt > user.bank) return sock.sendMessage(sender, { text: "❌ Nicht genug Geld auf der Bank!" })
            user.bank -= amt; user.money += amt; saveDB(loadDB())
            return sock.sendMessage(sender, { text: `✅ ${amt}€ abgehoben!` })
        }

        // -------------------------
        // INVENTAR
        // -------------------------
        if (text === "/inventory") {
            let inv = []
            if (user.cars.length) inv.push("🚗 Autos: " + user.cars.join(", "))
            if (user.houses.length) inv.push("🏠 Häuser: " + user.houses.join(", "))
            if (user.inventory.length) inv.push("🎒 Items: " + user.inventory.join(", "))
            if (!inv.length) inv.push("Leer")
            return sock.sendMessage(sender, { text: inv.join("\n") })
        }

        // -------------------------
        // SHOP
        // -------------------------
        if (text === "/shop") {
            let message = "🛒 *Shop*\n"
            message += "\n🚗 Autos:\n" + shop.cars.map(c => `${c.emoji} ${c.name} - ${c.price}€`).join("\n")
            message += "\n🏠 Häuser:\n" + shop.houses.map(h => `${h.emoji} ${h.name} - ${h.price}€`).join("\n")
            message += "\n🎒 Luxus:\n" + shop.luxury.map(l => `${l.emoji} ${l.name} - ${l.price}€`).join("\n")
            message += "\n🌿 Drogen:\n" + shop.drugs.map(d => `${d.emoji} ${d.name} - ${d.price}€`).join("\n")
            return sock.sendMessage(sender, { text: message })
        }

        if (text.startsWith("/buy")) {
            const itemName = text.split(" ").slice(1).join(" ")
            let found = null
            for (let category in shop) {
                found = shop[category].find(i => i.name.toLowerCase() === itemName.toLowerCase())
                if (found) break
            }
            if (!found) return sock.sendMessage(sender, { text: "❌ Item nicht gefunden!" })
            if (user.money < found.price) return sock.sendMessage(sender, { text: "❌ Nicht genug Geld!" })

            user.money -= found.price
            if (found.emoji === "🚗") user.cars.push(found.name)
            else if (found.emoji === "🏠") user.houses.push(found.name)
            else user.inventory.push(found.emoji + " " + found.name)
            saveDB(loadDB())
            return sock.sendMessage(sender, { text: `✅ Du hast ${found.emoji} ${found.name} gekauft!` })
        }

        // -------------------------
        // OWNER COMMANDS
        // -------------------------
        if (OWNER.includes(sender.split("@")[0])) {
            if (text.startsWith("/give")) {
                const args = text.split(" ")
                const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                const amount = parseInt(args[2])
                if (!target || isNaN(amount)) return
                const db = loadDB()
                db[target].money += amount
                saveDB(db)
                return sock.sendMessage(sender, { text: `👑 ${amount}€ an User vergeben!` })
            }
            if (text === "/bot off") return sock.sendMessage(sender, { text: "🤖 Bot wird ausgeschaltet!" })
            if (text === "/bot on") return sock.sendMessage(sender, { text: "🤖 Bot läuft!" })
        }

        // -------------------------
        // MENU
        // -------------------------
        if (text.startsWith("/menu")) {
            const page = text.split(" ")[1] || "1"
            let msgMenu = ""
            if (page === "1") msgMenu = "📌 *Menu 1*\n/ping\n/menu 2"
            if (page === "2") msgMenu = "💰 *Menu 2*\n/balance\n/deposit\n/withdraw\n/shop\n/buy <item>\n/inventory"
            if (page === "3") msgMenu = "👑 *Menu 3 (Owner)*\n/give @user <betrag>\n/bot on/off"
            return sock.sendMessage(sender, { text: msgMenu })
        }
    })
}

startBot()
