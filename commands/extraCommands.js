const cooldowns = new Map()

module.exports = [
  // 🧭 ADVENTURE & RPG
  {
    name: "adventure",
    category: "rpg",
    execute: async (ctx) => {
      const key = `${ctx.sender}_adventure`
      if (cooldowns.get(key)) return ctx.reply("⏳ Befehl noch auf Cooldown")
      cooldowns.set(key, true)
      setTimeout(() => cooldowns.delete(key), 60000) // 60s Cooldown

      // Belohnung simulieren
      ctx.reply("🧭 Du startest ein Abenteuer und bekommst 100€!")
    }
  },
  {
    name: "explore",
    category: "rpg",
    execute: async (ctx) => ctx.reply("🌍 Du erkundest die Welt und findest ein Item!")
  },
  {
    name: "questlog",
    category: "rpg",
    execute: async (ctx) => ctx.reply("📜 Deine Quests: Keine aktiven Quests")
  },
  {
    name: "dungeon",
    category: "rpg",
    execute: async (ctx) => ctx.reply("🏰 Du betrittst ein Dungeon. Vorsicht!")
  },
  {
    name: "bossfight",
    category: "rpg",
    execute: async (ctx) => ctx.reply("🐉 Bosskampf gestartet!")
  },

  // 🧠 SKILL SYSTEM
  {
    name: "skillpoints",
    category: "skills",
    execute: async (ctx) => ctx.reply("🧠 Du hast 5 Skillpunkte frei")
  },
  {
    name: "passives",
    category: "skills",
    execute: async (ctx) => ctx.reply("✨ Passivfähigkeiten: +5% Gold")
  },
  {
    name: "resetskills",
    category: "skills",
    execute: async (ctx) => ctx.reply("♻️ Alle Skills zurückgesetzt")
  },

  // 🏦 ECONOMY
  {
    name: "loan",
    category: "economy",
    execute: async (ctx) => ctx.reply("🏦 Du hast einen Kredit aufgenommen")
  },
  {
    name: "payloan",
    category: "economy",
    execute: async (ctx) => ctx.reply("💳 Kredit zurückgezahlt")
  },
  {
    name: "interest",
    category: "economy",
    execute: async (ctx) => ctx.reply("📈 Zinsen berechnet")
  },
  {
    name: "tax",
    category: "economy",
    execute: async (ctx) => ctx.reply("💸 Steuern gezahlt")
  },

  // 📦 ITEMS & LOOT
  {
    name: "lootbox",
    category: "items",
    execute: async (ctx) => ctx.reply("📦 Lootbox geöffnet. Du erhältst ein Item!")
  },
  {
    name: "crate",
    category: "items",
    execute: async (ctx) => ctx.reply("🎁 Kiste geöffnet!")
  },
  {
    name: "salvage",
    category: "items",
    execute: async (ctx) => ctx.reply("🧰 Item zerlegt, Materialien erhalten")
  },
  {
    name: "upgradeitem",
    category: "items",
    execute: async (ctx) => ctx.reply("⬆️ Item verbessert!")
  },

  // 🎁 EVENTS & TIMERS
  {
    name: "events",
    category: "events",
    execute: async (ctx) => ctx.reply("🎉 Aktive Events: Keine")
  },
  {
    name: "eventjoin",
    category: "events",
    execute: async (ctx) => ctx.reply("✅ Du bist dem Event beigetreten")
  },
  {
    name: "cooldowns",
    category: "events",
    execute: async (ctx) => ctx.reply("⏳ Deine Cooldowns werden angezeigt")
  },

  // 👥 SOCIAL
  {
    name: "reputation",
    category: "social",
    execute: async (ctx) => ctx.reply("⭐ Dein Ruf: Neutral")
  },
  {
    name: "vouch",
    category: "social",
    execute: async (ctx) => ctx.reply("👍 Du hast einen Vouch vergeben")
  },
  {
    name: "giftitem",
    category: "social",
    execute: async (ctx) => ctx.reply("🎁 Item verschenkt")
  },

  // 🌍 WORLD / IMMERSION
  {
    name: "season",
    category: "world",
    execute: async (ctx) => ctx.reply("🍂 Aktuelle Saison: Frühling")
  },
  {
    name: "worldtime",
    category: "world",
    execute: async (ctx) => ctx.reply("🕒 Weltzeit: 12:00 Uhr")
  },
  {
    name: "weather",
    category: "world",
    execute: async (ctx) => ctx.reply("🌦️ Aktuelles Wetter: Sonnig")
  },

  // 👑 USER MANAGEMENT (ADMIN)
  {
    name: "ban",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🔨 User gebannt!")
  },
  {
    name: "unban",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("✅ Ban aufgehoben!")
  },
  {
    name: "mute",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🔇 User gemutet!")
  },
  {
    name: "unmute",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🔊 Stummschaltung aufgehoben!")
  },
  {
    name: "kick",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("👢 User aus der Gruppe geworfen!")
  },
  {
    name: "promote",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🛡 User zum Admin befördert!")
  },
  {
    name: "demote",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("⚔ User vom Adminstatus entfernt!")
  },

  // 📝 CHAT MANAGEMENT
  {
    name: "lock",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🔒 Gruppe gesperrt: Nur Admins dürfen schreiben!")
  },
  {
    name: "unlock",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🔓 Gruppe wieder offen!")
  },
  {
    name: "clear",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🧹 Chat wurde geleert!")
  },
  {
    name: "purge",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🗑 Letzte Nachrichten gelöscht!")
  },
  {
    name: "slowmode",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🐢 Slowmode aktiviert!")
  },

  // 🚨 ANTI-SPAM / MODERATION
  {
    name: "antilink",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🔗 Anti-Link Modus an/aus!")
  },
  {
    name: "antispam",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("⚠️ Anti-Spam Modus an/aus!")
  },
  {
    name: "antibadword",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🚫 Anti-Beleidigungen aktiviert!")
  },
  {
    name: "warn",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("⚠️ User wurde verwarnt!")
  },
  {
    name: "warnings",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("📄 Anzahl der Warnungen abgefragt!")
  },

  // 📌 INFOS & LOGS
  {
    name: "logs",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("📜 Aktivitäten-Logs angezeigt!")
  },
  {
    name: "reports",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("📝 User-Meldungen angezeigt!")
  },
  {
    name: "audit",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🔍 Admin-Audit durchgeführt!")
  },

  // 📣 SONSTIGE ADMIN-TOOLS
  {
    name: "setwelcome",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("👋 Begrüßungsnachricht gesetzt!")
  },
  {
    name: "setbye",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("👋 Verabschiedungsnachricht gesetzt!")
  },
  {
    name: "autorole",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("🎖 Automatische Rollen aktiviert!")
  },
  {
    name: "announce",
    category: "admin",
    admin: true,
    execute: async (ctx) => ctx.reply("📢 Ankündigung gesendet!")
  }

]
