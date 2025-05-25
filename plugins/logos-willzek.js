import fetch from 'node-fetch';

const logos = {
  logocorazon: 'corazon',
  logochristmas: 'christmas',
  logopareja: 'pareja',
  logoglitch: 'glitch',
  logosad: 'sad',
  logogaming: 'gaming',
  logosolitario: 'solitario',
  logodragonball: 'dragonball',
  logoneon: 'neon',
  logogatito: 'gatito',
  logochicagamer: 'chicagamer',
  logonaruto: 'naruto',
  logofuturista: 'futurista',
  logonube: 'nube',
  logoangel: 'angel',
  logocielo: 'cielo',
  logograffiti3d: 'graffiti3d',
  logomatrix: 'matrix',
  logohorror: 'horror',
  logoalas: 'alas',
  logoarmy: 'army',
  logopubg: 'pubg',
  logopubgfem: 'pubgfem',
  logolol: 'lol',
  logoamongus: 'amongus',
  logovideopubg: 'videopubg',
  logovideotiger: 'videotiger',
  logovideointro: 'videointro',
  logovideogaming: 'videogaming',
  logoguerrero: 'guerrero',
  logoportadaplayer: 'portadaplayer',
  logoportadaff: 'portadaff',
  logoportadapubg: 'portadapubg',
  logoportadacounter: 'portadacounter'
  // Agrega más si lo deseas
};

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply('⚠️ Ingresa un texto para el logo.');
  let text = args.join(' ').split('|')[0];
  let cmd = command.toLowerCase();
  if (!logos[cmd]) return m.reply('⚠️ Comando de logo no válido.');

  try {
    await m.reply('⏳ Generando logo, por favor espera...');
    let res = await fetch(`https://carisys.online/api/logos/${logos[cmd]}?texto=${encodeURIComponent(text)}`);
    if (!res.ok) throw 'No se pudo conectar a la API';
    let json = await res.json();
    if (!json.url) throw 'No se generó imagen, intenta con otro texto.';
    await conn.sendFile(m.chat, json.url, 'logo.jpg', '', m);
  } catch (e) {
    await m.reply('❌ Error generando el logo. Intenta más tarde.\n' + (e && e.message ? e.message : e));
  }
};

handler.help = Object.keys(logos);
handler.tags = ['fun'];
handler.command = new RegExp('^(' + Object.keys(logos).join('|') + ')$', 'i');
export default handler;