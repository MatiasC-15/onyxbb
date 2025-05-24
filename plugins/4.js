const handler = async (m, { conn, usedPrefix }) => {
    await conn.sendMessage(
        m.chat,
        {
            text: '🔹 Selecciona una opción:',
            buttons: [
                {buttonId: `${usedPrefix}owner`, buttonText: {displayText: "👑 Owner"}, type: 1},
                {buttonId: `${usedPrefix}ping`, buttonText: {displayText: "🏓 Ping"}, type: 1}
            ],
            headerType: 1 // Necesario para botones
        },
        { quoted: m }
    )
}

handler.command = /^init$/i

export default handler