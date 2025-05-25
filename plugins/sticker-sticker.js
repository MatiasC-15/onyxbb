import { sticker } from '../lib/sticker.js'
import { webp2png } from '../lib/webp2mp4.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'

const handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = q.mimetype || q.mediaType || ''
    if (!/webp|image|video/g.test(mime)) return m.reply('💫 Responde a una imagen o video para convertirlo en sticker.')
    let media = await q.download?.()
    if (!media) return m.reply('⚡ No se pudo descargar el archivo.')
    if (/video/g.test(mime) && q.seconds > 8) return m.reply('☁️ ¡El video no puede durar más de 8 segundos!')
    let stickerBuffer
    if (/webp/g.test(mime)) {
      stickerBuffer = await webp2png(media)
    } else if (/image/g.test(mime)) {
      stickerBuffer = await sticker(media, false, '', '') // Si tu función acepta más argumentos, ajústalo
    } else if (/video/g.test(mime)) {
      stickerBuffer = await sticker(media, true, '', '') // true para video
    }
    if (!stickerBuffer) return m.reply('❌ No se pudo crear el sticker.')
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
  } catch (e) {
    console.error(e)
    return m.reply('❌ Ocurrió un error al generar el sticker.')
  }
}

handler.help = ['sticker (responde a una imagen o video)']
handler.tags = ['herramientas']
handler.command = ['s', 'sticker', 'stiker']

export default handler