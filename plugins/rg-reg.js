import { createHash } from 'crypto';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    let regFormat = /\|?(.*)([.|] *?)([0-9]*)$/i;

    if (user.registered) {
        return m.reply(`✅ Ya estás registrado.\n\nSi deseas registrarte nuevamente, elimina tu registro actual usando el comando:\n*${usedPrefix}unreg*`);
    }

    if (!regFormat.test(text)) {
        return m.reply(`❌ Formato incorrecto.\n\nUsa el comando así: *${usedPrefix + command} nombre.edad*\nEjemplo: *${usedPrefix + command} FnBot.18*`);
    }

    let [_, name, splitter, age] = text.match(regFormat);
    if (!name || !age) return m.reply('❌ El nombre y la edad son obligatorios.');
    if (name.length > 50) return m.reply('❌ El nombre no puede exceder los 50 caracteres.');

    age = parseInt(age);
    if (isNaN(age) || age < 5 || age > 100) return m.reply('❌ La edad ingresada no es válida.');

    user.name = name.trim();
    user.age = age;
    user.registered = true;
    user.regTime = +new Date();

    let confirmMessage = `🎉 *¡Registro exitoso!*\n\n👤 *Usuario:* ${name}\n🎂 *Edad:* ${age} años\n✅ *Estado:* Verificado`;

    await conn.sendFile(m.chat, 'https://n.uguu.se/tdZvJaVR.jpg', 'registro.jpg', confirmMessage, m);
};

handler.help = ['reg'];
handler.tags = ['register'];
handler.command = ['reg', 'register', 'verificar', 'verify'];

export default handler;