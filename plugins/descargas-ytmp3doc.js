import axios from 'axios';

const isValidYouTubeUrl = (url) => {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '☄';
  const loading = '⏳';
  const errorEmoji = '❌';

  if (!args[0]) return m.reply(`ᴘᴏʀ ғᴀᴠᴏʀ, ɪɴɢʀᴇsᴀ ᴜɴ ᴇɴʟᴀᴄᴇ ᴅᴇ *YouTube*`);

  if (!isValidYouTubeUrl(args[0])) return m.reply(`ᴇʟ ᴇɴʟᴀᴄᴇ ɴᴏ ᴘᴀʀᴇᴄᴇ sᴇʀ ᴠᴀ́ʟɪᴅᴏ ᴅᴇ YᴏᴜTᴜʙᴇ`);

  try {
    await m.react(loading);

    const ytURL = encodeURIComponent(args[0]);
    const apiURL = `https://api.sylphy.xyz/download/ytmp3?url=${ytURL}&apikey=sylph-30fc019324`;

    const { data } = await axios.get(apiURL);

    if (!data.status || !data.res || !data.res.url) {
      throw new Error('La API no devolvió un enlace válido de audio.');
    }

    await conn.sendMessage(m.chat, {
      document: { url: data.res.url },
      mimetype: 'audio/mpeg',
      fileName: `${data.res.title}.mp3`
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    await m.react(errorEmoji);
    m.reply(`❌ ᴏᴄᴜʀʀɪᴏ́ ᴜɴ ᴇʀʀᴏʀ:\n${err.message || err}`);
  }
};

handler.help = ['ytmp3doc <url>'];
handler.tags = ['downloader'];
handler.command = ['ytmp3doc'];
handler.limit = 1;

export default handler;