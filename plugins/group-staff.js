let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, {
      text: '🚫 *Staff no disponible por el momento. Próximamente.*'
    }, { quoted: m });

    // Si quieres reacción opcional
    if (global.emoji) {
      await m.react(global.emoji);
    }
  } catch (error) {
    console.error("Error al ejecutar el comando staff:", error);
    await m.reply(
      "⚠️ *Error al ejecutar el comando:*\n" +
      "Por favor, verifica la configuración del bot o consulta la consola para más detalles."
    );
  }
};

// Configuración del comando
handler.help = ["staff"];
handler.command = ["colaboradores", "staff"];
handler.register = true;
handler.tags = ["main"];

export default handler;