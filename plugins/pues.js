import fetch from 'node-fetch'
let handler = async (m, { conn, command }) => {
  try {
    let res = await fetch('https://api.fgmods.xyz/api/nsfw-nime/pussy?apikey=fg_ZIKajBcu')
    let json = await res.json()
    if (!json.result) throw 'Sin resultado.'
    await conn.sendFile(m.chat, json.result, 'pussy.jpg', `🔞`, m)
  } catch {
    await m.reply('❌ Error, intenta de nuevo más tarde.')
  }
}
handler.help = ['pussy']
handler.tags = ['nsfw']
handler.command = ['pussy']
export default handler