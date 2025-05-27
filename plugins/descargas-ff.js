import fetch from 'node-fetch'
let handler = async (m, { conn }) => {
  try {
    let response = await fetch('https://api.dorratz.com/v2/pix-ai?prompt=anime+alya');
    if (!response.ok) throw '❌ Error de conexión con la API.';
    let json = await response.json();
    if (!json.result || typeof json.result !== 'string') throw '❌ No se encontró imagen.';
    await conn.sendFile(m.chat, json.result, 'alya.jpg', '✨', m);
  } catch (e) {
    await m.reply(typeof e === 'string' ? e : '❌ Error, intenta de nuevo más tarde.');
  }
}
handler.help = ['alya']
handler.tags = ['ai']
handler.command = ['alya']
export default handler