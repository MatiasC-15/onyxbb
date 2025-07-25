process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts';
import { createRequire } from 'module';
import {fileURLToPath, pathToFileURL} from 'url'
import { platform } from 'process';
import * as ws from 'ws';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import boxen from 'boxen';
import P from 'pino';
import path, {join} from 'path'
import { Low, JSONFile } from 'lowdb';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser , Browsers } from '@whiskeysockets/baileys';
import pkg from 'google-libphonenumber';
import readline from 'readline';
import NodeCache from 'node-cache';
import { Boom } from '@hapi/boom';

const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();
const { chain } = lodash;

global.sessions = 'Session/Fn';
global.jadi = 'Session/SubBot';
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

let { say } = cfonts;
console.log(chalk.magentaBright('\nIniciando...'));

say('FnBot-MD', {
    font: 'simple',
    align: 'left',
    gradient: ['green', 'white']
});
say('By ☆ Ricardo', {
    font: 'console',
    align: 'center',
    colors: ['cyan', 'magenta', 'yellow']
});

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#!./]');

global.db = new Low(new JSONFile('datos.json'));
globalThis.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function () {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
            }
        }, 1 * 1000));
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};

await loadDatabase();

const { state, saveCreds } = await useMultiFileAuthState(global.sessions);
const msgRetryCounterMap = new Map();
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = global.botNumber;

const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) {
    opcion = '1';
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
    do {
        opcion = await question(chalk.bold.white("Seleccione una opción:\n") + chalk.blueBright("1. Con código QR\n") + chalk.cyan("2. Con código de texto de 8 dígitos\n--> "));
        if (!/^[1-2]$/.test(opcion)) {
            console.log(chalk.bold.redBright(`No se permiten números que no sean 1 o 2, tampoco letras o símbolos especiales.`));
        }
    } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.sessions}/creds.json`));
}

const connectionOptions = {
    logger: P({ level: 'silent' }),
    printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
    mobile: MethodMobile,
    browser: opcion == '1' ? Browsers.macOS("Desktop") : methodCodeQR ? Browsers.macOS("Desktop") : Browsers.macOS("Chrome"),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, P({ level: "fatal" })),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
        try {
            let jid = jidNormalizedUser (key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg?.message || "";
        } catch (error) {
            return "";
        }
    },
    msgRetryCounterCache: msgRetryCounterMap,
    version: version,
};

global.conn = makeWASocket(connectionOptions);

if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
    if (opcion === '2' || methodCode) {
        opcion = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (!!phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                do {
                    phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`[ ✿ ]  Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.magentaBright('---> ')}`)));
                    phoneNumber = phoneNumber.replace(/\D/g, '');
                    if (!phoneNumber.startsWith('+')) {
                        phoneNumber = `+${phoneNumber}`;
                    }
                } while (!await isValidPhoneNumber(phoneNumber));
                rl.close();
                addNumber = phoneNumber.replace(/\D/g, '');
                setTimeout(async () => {
                    let codeBot = await conn.requestPairingCode(addNumber);
                    codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                    console.log(chalk.bold.white(chalk.bgMagenta(`[ ✿ ]  Código:`)), chalk.bold.white(chalk.white(codeBot)));
                }, 3000);
            }
        }
    }
}

conn.isInit = false;
conn.well = false;
conn.logger.info(`[ ✿ ]  H E C H O\n`);

async function connectionUpdate(update) {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
        const userJid = jidNormalizedUser (conn.user.id);
        const userName = conn.user.name || conn.user.verifiedName || "Desconocido";
        console.log(chalk.green.bold(`[ ✿ ]  Conectado a: ${userName}`));
    }
    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    if (connection === 'close') {
        if (reason === DisconnectReason.badSession) {
            console.log(chalk.bold.cyanBright(`\n💦 Sin conexión, borra la sesión principal del Bot, y conéctate nuevamente.`));
        } else if (reason === DisconnectReason.connectionClosed) {
            console.log(chalk.bold.magentaBright(`\n🎋 Reconectando la conexión del Bot...`));
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionLost) {
            console.log(chalk.bold.blueBright(`\n🍁 Conexión perdida con el servidor, reconectando el Bot...`));
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.bold.redBright(`\n🍀 Sin conexión, borra la sesión principal del Bot, y conéctate nuevamente.`));
            await global.reloadHandler(true).catch(console.error);
        } else {
            console.log(chalk.bold.redBright(`\n🎍 Conexión cerrada, conéctate nuevamente.`));
        }
    }
}

conn.ev.on('connection.update', connectionUpdate);
conn.ev.on('creds.update', saveCreds.bind(global.conn, true));

// Funciones de limpieza
function clearTmp() {
    const tmpDir = join(__dirname, 'tmp');
    const filenames = readdirSync(tmpDir);
    filenames.forEach(file => {
        const filePath = join(tmpDir, file);
        unlinkSync(filePath);
    });
}

function purgeSession() {
    let prekey = [];
    let directorio = readdirSync(`./${global.sessions}`);
    let filesFolderPreKeys = directorio.filter(file => {
        return file.startsWith('pre-key-');
    });
    prekey = [...prekey, ...filesFolderPreKeys];
    filesFolderPreKeys.forEach(files => {
        unlinkSync(`./${global.sessions}/${files}`);
    });
}

setInterval(async () => {
    if (!conn || !conn.user) return;
    await clearTmp();
    console.log(chalk.bold.cyanBright(`\n🐻‍❄️ Archivos de la carpeta TMP no necesarios han sido eliminados del servidor.`));
}, 1000 * 60 * 4); // Cada 4 minutos

setInterval(async () => {
    if (!conn || !conn.user) return;
    await purgeSession();
    console.log(chalk.bold.cyanBright(`\n🐞 Archivos de la carpeta ${global.sessions} no necesarios han sido eliminados del servidor.`));
}, 1000 * 60 * 10); // Cada 10 minutos

// Validación de números de teléfono
async function isValidPhoneNumber(number) {
    try {
        number = number.replace(/\s+/g, '');
        const parsedNumber = phoneUtil.parseAndKeepRawInput(number);
        return phoneUtil.isValidNumber(parsedNumber);
    } catch (error) {
        return false;
    }
}

// Reinicio automático
setInterval(() => {
    console.log('[ ✿ ]  Reiniciando...');
    process.exit(0);
}, 10800000); // Cada 3 horas

// Manejo de errores no capturados
process.on('uncaughtException', console.error);
