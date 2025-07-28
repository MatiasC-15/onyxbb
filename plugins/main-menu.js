let handler = async (m, { conn, args }) => {
  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let _uptime = process.uptime() * 1000
  let uptime = clockString(_uptime)
  let totalreg = Object.keys(global.db.data.users).length

  let txt = `Hola! Soy *${botname}* (｡•̀ᴗ-)✧
Aquí tienes la lista de comandos
╭┈ ↷
│ᰔᩚ Cliente » @${userId.split('@')[0]}
│❀ Modo » Publico
│ⴵ Activado » ${uptime}
│✰ Usuarios » ${totalreg}
╰─────────────────

• :･ﾟ⊹˚• \`『 Comandos 』\` •˚⊹:･ﾟ•

ᰔᩚ *#play • #play2*
> ✦ Descarga música/video de YouTube.
ᰔᩚ *#tagall*
> ✦ Invoca a todos los usuarios de un grupo.
ᰔᩚ *#hidetag*
> ✦ Envia un mensaje mencionando a todos los usuarios.
ᰔᩚ *#sticker*
> ✦ Crea stickers de (imagen/video).
ᰔᩚ *#tourl*
> ✦ Convierte un enlace a un formato específico.
ᰔᩚ *#spotify*
> ✦ Comandos relacionados con Spotify.

• :･ﾟ⊹˚• \`『 Bienvenida 』\` •˚⊹:･ﾟ•

❍ Comandos de bienvenida y despedida.
ᰔᩚ *#setwelcome*
> ✦ Establecer un mensaje de bienvenida personalizado.
ᰔᩚ *#setbye*
> ✦ Establecer un mensaje de despedida personalizado.

`.trim()

  await conn.sendMessage(m.chat, { 
    text: txt,
    contextInfo: {
      mentionedJid: [userId],
      externalAdReply: {                
        title: botname,
        body: textbot,
        mediaType: 1,
        mediaUrl: './src/catalogo1.jpg',
        sourceUrl: './src/catalogo1.jpg',
        thumbnail: await (await fetch('./src/catalogo1.jpg')).buffer(),
        showAdAttribution: false,
        containsAutoReply: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}
