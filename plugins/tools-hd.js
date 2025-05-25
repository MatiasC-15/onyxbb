import axios from "axios";
import uploadImage from "../lib/uploadImage.js";

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || q.mediaType || "";
    if (!mime.startsWith("image/")) {
      return conn.reply(m.chat, "𝘙𝘦𝘴𝘱𝘰𝘯𝘥𝘦 𝘢 𝘶𝘯𝘢 𝘪𝘮𝘢𝘨𝘦𝘯 𝘱𝘢𝘳𝘢 𝘵𝘳𝘢𝘯𝘴𝘧𝘰𝘳𝘮𝘢𝘳𝘭𝘢 𝘦𝘯 𝘏𝘋.", m);
    }

    await m.react("🕓");
    const imgBuffer = await q.download?.();
    const urlSubida = await uploadImage(imgBuffer);
    const upscaledBuffer = await getUpscaledImage(urlSubida);

    await conn.sendFile(
      m.chat,
      upscaledBuffer,
      "upscaled.jpg",
      "𝘈𝘲𝘶í 𝘵𝘪𝘦𝘯𝘦 𝘴𝘶 𝘪𝘮𝘢𝘨𝘦𝘯.",
      m,rcanal
    );
    await m.react("✅");
  } catch (e) {
    console.error("Error:", e);
    await m.react("✖️");
    conn.reply(m.chat, "Ocurrió un error al mejorar la imagen.", m);
  }
};

handler.help = ["hd"];
handler.tags = ["tools"];
handler.command = ["remini", "hd", "enhance"];
handler.register = false;
export default handler;

async function getUpscaledImage(imageUrl) {
  const apiUrl = `https://jerofc.my.id/api/remini?url=${encodeURIComponent(imageUrl)}`;
  const apiResponse = await axios.get(apiUrl);
  if (!apiResponse.data?.status || !apiResponse.data.data?.image) {
    throw new Error('API de mejora devolvió respuesta inválida');
  }
  const enhancedImageUrl = apiResponse.data.data.image;
  const imageResponse = await axios.get(enhancedImageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(imageResponse.data);
}