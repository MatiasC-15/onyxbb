import fetch from 'node-fetch';

const logos = {
  logocorazon: 'text-heart-flashlight-188',
  logochristmas: 'christmas-effect-by-name-376',
  logopareja: 'sunlight-shadow-text-204',
  logoglitch: 'create-digital-glitch-text-effects-online-767',
  logosad: 'write-text-on-wet-glass-online-589',
  logogaming: 'make-team-logo-online-free-432',
  logosolitario: 'create-typography-text-effect-on-pavement-online-774',
  logodragonball: 'create-dragon-ball-style-text-effects-online-809',
  logoneon: 'create-impressive-neon-glitch-text-effects-online-768',
  logogatito: 'handwritten-text-on-foggy-glass-online-680',
  logochicagamer: 'create-cute-girl-gamer-mascot-logo-online-687',
  logonaruto: 'naruto-shippuden-logo-style-text-effect-online-808',
  logofuturista: 'light-text-effect-futuristic-technology-style-648',
  logonube: 'cloud-text-effect-139',
  logoangel: 'angel-wing-effect-329',
  logocielo: 'create-a-cloud-text-effect-in-the-sky-618',
  logograffiti3d: 'text-graffiti-3d-208',
  logomatrix: 'matrix-text-effect-154',
  logohorror: 'blood-writing-text-online-77',
  logoalas: 'the-effect-of-galaxy-angel-wings-289',
  logoarmy: 'free-gaming-logo-maker-for-fps-game-team-546',
  logopubg: 'pubg-logo-maker-cute-character-online-617',
  logopubgfem: 'pubg-mascot-logo-maker-for-an-esports-team-612',
  logolol: 'make-your-own-league-of-legends-wallpaper-full-hd-442',
  logoamongus: 'create-a-cover-image-for-the-game-among-us-online-762',
  logovideopubg: 'lightning-pubg-video-logo-maker-online-615',
  logovideotiger: 'create-digital-tiger-logo-video-effect-723',
  logovideointro: 'free-logo-intro-video-maker-online-558',
  logovideogaming: 'create-elegant-rotation-logo-online-586',
  logoguerrero: 'create-project-yasuo-logo-384',
  logoportadaplayer: 'create-the-cover-game-playerunknown-s-battlegrounds-401',
  logoportadaff: 'create-free-fire-facebook-cover-online-567',
  logoportadapubg: 'create-facebook-game-pubg-cover-photo-407',
  logoportadacounter: 'create-youtube-banner-game-cs-go-online-403'
  // Agrega más si lo deseas
};

const apikey = 'TU_APIKEY_LOLHUMAN'; // ← Pega aquí tu apikey de lolhuman

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply('⚠️ Ingresa un texto para el logo.');
  let texto = args.join(' ').split('|')[0];
  let tipo = logos[command];
  if (!tipo) return m.reply('⚠️ Comando de logo no válido.');

  try {
    await m.reply('⏳ Generando logo, por favor espera...');
    let url = `https://api.lolhuman.xyz/api/ephoto360/${tipo}?apikey=${apikey}&text=${encodeURIComponent(texto)}`;
    let res = await fetch(url);
    if (!res.ok) throw 'No se pudo conectar a la API';
    let json = await res.json();
    if (!json.result) throw 'No se generó imagen. Prueba con otro texto.';
    await conn.sendFile(m.chat, json.result, 'logo.jpg', '', m);
  } catch (e) {
    await m.reply('❌ Error generando el logo. Intenta más tarde.\n' + (e && e.message ? e.message : e));
  }
};

handler.help = Object.keys(logos);
handler.tags = ['fun'];
handler.command = new RegExp('^(' + Object.keys(logos).join('|') + ')$', 'i');
export default handler;