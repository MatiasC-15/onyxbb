const handler = async (m, { conn, usedPrefix }) => {
  // Mensaje principal
  let texto = '🔹 Selecciona una opción:'
  // Puedes poner una url de imagen, o null si no quieres imagen
  let thumbnail = null // o 'https://files.catbox.moe/b96pce.jpg'

  // Botones
  const botones = [
    ['👑 Owner', `${usedPrefix}owner`],
    ['🏓 Ping', `${usedPrefix}ping`]
  ]

  // Enviar los botones usando sendButton
  await conn.sendButton(m.chat, texto, 'Bot Barboza', thumbnail, botones, m)
}

handler.command = /^init$/i

export default handler