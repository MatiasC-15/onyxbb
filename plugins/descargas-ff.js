import fetch from 'node-fetch'
let handler = async (m, { conn, command }) => {
  try {
    let res = await fetch('https://api.dorratz.com/v2/pix-ai?prompt=anime+alya')
    let json = await res.json()
    if (!json.status || !json.result) throw 'Sin resultado.'
    await conn.sendFile(m.chat, json.result, 'alya.jpg', '✨', m)
  } catch {
    await m.reply('❌ Error, intenta de nuevo más tarde.')
  }
}
handler.help = ['alya']
handler.tags = ['ai']
handler.command = ['alya']
export default handler