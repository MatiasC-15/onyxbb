const handler = async (m, { conn, command }) => {
  try {
    // FnBot
    let res = await fetch('https://api.fgmods.xyz/api/nsfw-nime/pussy?apikey=fg_ZIKajBcu');
    let json = await res.json();
    if (!json.result) throw 'Sin resultado de la API';
    // FnBot
    await conn.sendFile(m.chat, json.result, 'pussy.jpg', `🔞 ${command}`, m);
  } catch (e) {
    await m.reply('❌ Error, la API no responde o hay límite de peticiones.');
  }
};

handler.help = ['pussy'];
handler.tags = ['nsfw'];
handler.command = ['pussy'];

export default handler;