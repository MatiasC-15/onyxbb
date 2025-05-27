const handler = async (m, { conn, args, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  if (user.registered) return m.reply('Ya estás registrado.')
  let name = m.name || 'SinNombre'
  let edad = 18
  user.name = name + '✓'
  user.age = edad
  user.regTime = +new Date()
  user.registered = true
  user.coin = (user.coin || 0) + 40
  user.exp = (user.exp || 0) + 300
  user.joincount = (user.joincount || 0) + 20
  await m.reply(`✅ Registro automático exitoso!\n\nNombre: ${name}\nEdad: ${edad}\nRecompensa: 40 monedas, 300 exp, 20 tokens`)
}
handler.help = ['autoreg']
handler.tags = ['rg']
handler.command = ['autoreg']
export default handler