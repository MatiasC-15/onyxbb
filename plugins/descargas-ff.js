import fetch from 'node-fetch'
let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.dorratz.com/v2/pix-ai?prompt=anime+alya')
    let json = await res.json()

    // Si la API responde con un array de resultados, toma el primero
    let url = ''
    if (Array.isArray(json.result)) {
      url = json.result[0]
    } else if (typeof json.result === 'string') {
      url = json.result
    }

    if (!url || !url.startsWith('http')) throw '❌ No se encontró imagen.'

    await conn.sendFile(m.chat, url, 'alya.jpg', '✨', m)
  } catch (e) {
    await m.reply(typeof e === 'string' ? e : '❌ Error, intenta de nuevo más tarde.')
  }
}
handler.help = ['alya']
handler.tags = ['ai']
handler.command = ['alya']
export default handler