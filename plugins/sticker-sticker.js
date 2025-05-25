import { sticker as createSticker } from '../lib/sticker.js'

const handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = q.mimetype || q.mediaType || ''
    if (!/webp|image|video/g.test(mime)) return m.reply('💫 Responde a una imagen, sticker o video para hacer sticker.')
    let media = await q.download?.()
    if (!media) return m.reply('⚡ No se pudo descargar el archivo.')
    if (/video/g.test(mime) && q.seconds > 8) return m.reply('☁️ ¡El video no puede durar más de 8 segundos!')
    let stiker = await createSticker(media, false, '', '')
    if (!stiker) return m.reply('❌ No se pudo crear el sticker.')
    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
  } catch (e) {
    console.error(e)
    return m.reply('❌ Ocurrió un error al generar el sticker.')
  }
}

handler.help = ['sticker (responde a imagen o video)']
handler.tags = ['herramientas']
handler.command = ['s', 'sticker', 'stiker']

export default handler