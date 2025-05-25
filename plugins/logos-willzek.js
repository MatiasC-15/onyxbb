import axios from 'axios';
import FormData from 'form-data';
import cheerio from 'cheerio';

const modelos = {
    glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    narutotext: 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html',
    dragonball: 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
    neonlight: 'https://en.ephoto360.com/neon-light-text-effect-online-882.html',
    pubglogo: 'https://en.ephoto360.com/pubg-logo-maker-cute-character-online-617.html',
    harrypotter: 'https://en.ephoto360.com/create-harry-potter-text-effect-online-853.html',
    marvel: 'https://en.ephoto360.com/create-marvel-studios-logo-style-text-effect-online-710.html',
    pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    amongustext: 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
    // ... agrega más si lo deseas
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*❗ Ingresa un texto* *Ejemplo:* ${usedPrefix + command} GokuBlack`, m);

    m.reply('⏳ Creando tu logo, espera...');

    const modelo = modelos[command.toLowerCase()];
    if (!modelo) return m.reply(`*❗ Modelo de texto no encontrado:* ${command}`);

    try {
        const data = await ephoto(modelo, text);
        if (!data) throw new Error('No se pudo generar la imagen. Puede que el efecto cambió o la web está protegida.');
        await conn.sendMessage(m.chat, { image: { url: data } }, { quoted: m });
    } catch (e) {
        console.error('Error ephoto:', e);
        await m.reply(`❌ Error generando el logo. Puede que el efecto ya no esté disponible o la web esté protegida.\n*Detalles:* ${e.message || e}`);
    }
};

async function ephoto(url, text) {
    // Paso 1: GET para tokens
    const initialResponse = await axios.get(url, {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
        }
    });
    const $ = cheerio.load(initialResponse.data);
    const token = $('input[name=token]').val();
    const buildServer = $('input[name=build_server]').val();
    const buildServerId = $('input[name=build_server_id]').val();
    if (!token || !buildServer || !buildServerId) return null;

    // Paso 2: POST con form-data
    const formData = new FormData();
    formData.append('text[]', text);
    formData.append('token', token);
    formData.append('build_server', buildServer);
    formData.append('build_server_id', buildServerId);

    const postResponse = await axios({
        url: url,
        method: 'POST',
        data: formData,
        headers: {
            'Accept': '*/*',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'cookie': initialResponse.headers['set-cookie']?.join(' '),
            ...formData.getHeaders()
        }
    });

    // Paso 3: POST final para obtener imagen
    const $$ = cheerio.load(postResponse.data);
    const formValueInput = JSON.parse($$('input[name=form_value_input]').val() || '{}');
    if (!formValueInput || !formValueInput.text) return null;
    formValueInput['text[]'] = formValueInput.text;
    delete formValueInput.text;

    const finalResponse = await axios.post('https://en.ephoto360.com/effect/create-image', new URLSearchParams(formValueInput), {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'cookie': initialResponse.headers['set-cookie'].join(' ')
        }
    });

    if (!finalResponse.data || !finalResponse.data.image) return null;
    return buildServer + finalResponse.data.image;
}

handler.help = Object.keys(modelos);
handler.tags = ['ephoto'];
handler.command = handler.help;

export default handler;