import axios from 'axios';

const isValidYouTubeUrl = (url) => {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🌼';
  const loading = '⏳';
  const successEmoji = '✅';
  const errorEmoji = '❌';

  if (!args[0]) {
    return m.reply(`Ingresa un link de YouTube`);
  }

  if (!isValidYouTubeUrl(args[0])) {
    return m.reply(`El enlace es inválido`);
  }

  try {
    await m.react(loading);

    const ytURL = encodeURIComponent(args[0]);
    const apiURL = `https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${ytURL}`;

    const { data } = await axios.get(apiURL);

    if (!data.status || !data.download) {
      throw new Error('La API no devolvió un enlace de descarga válido.');
    }

    await conn.sendMessage(m.chat, {
      audio: { url: data.download },
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m });

    await m.react(successEmoji);

  } catch (err) {
    console.error(err);
    await m.react(errorEmoji);
    m.reply(`❌ ᴏᴄᴜʀʀɪᴏ́ ᴜɴ ᴇʀʀᴏʀ:\n${err.message || err}`);
  }
};

handler.help = ['ytptt <url>'];
handler.tags = ['downloader'];
handler.command = ['ytaudio', 'mp3', 'ytmp3'];
handler.limit = 1;

export default handler;