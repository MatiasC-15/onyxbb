process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, jidNormalizedUser , DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs';
import path, { join } from 'path';
import readline from 'readline';
import chalk from 'chalk';
import pino from 'pino';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import { Boom } from '@hapi/boom';
import cfonts from 'cfonts';
import NodeCache from 'node-cache';
import { spawn } from 'child_process';

const { chain } = lodash;
global.db = new Low(new JSONFile('datos.json'));
global.db.data = { users: {}, chats: {}, settings: {}, ...(global.db.data || {}) };
global.db.chain = chain(global.db.data);

const { state, saveCreds } = await useMultiFileAuthState(global.sessions);

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ["Ubuntu", "Chrome", "120.0.0.0"],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
    },
    markOnlineOnConnect: true,
    version: (await fetchLatestBaileysVersion()).version,
};

import { makeWASocket } from './lib/simple.js';
global.conn = makeWASocket(connectionOptions);

if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
    console.log(chalk.greenBright('Por favor, escanea el código QR para iniciar sesión.'));
}

let archivosSesion = fs.readdirSync(`./${global.sessions}`);
console.log('Archivos de sesión:', archivosSesion);

let archivosSubBots = fs.readdirSync(`./${global.jadi}`);
console.log('Archivos de sub-bots:', archivosSubBots);

import pkg from 'google-libphonenumber';
const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();

async function isValidPhoneNumber(number) {
    try {
        number = number.replace(/\s+/g, '');
        const parsedNumber = phoneUtil.parseAndKeepRawInput(number);
        return phoneUtil.isValidNumber(parsedNumber);
    } catch (error) {
        return false;
    }
}

global.conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
        console.log(chalk.green.bold('¡Conectado a WhatsApp!'));
    }
    if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.red('Sesión cerrada, vuelve a escanear el código QR.'));
        }
    }
});

function clearTmp() {
    const tmpDir = join(__dirname, 'tmp');
    const filenames = fs.readdirSync(tmpDir);
    filenames.forEach(file => {
        const filePath = join(tmpDir, file);
        fs.unlinkSync(filePath);
    });
}

function purgeSession() {
    let prekey = [];
    let directorio = fs.readdirSync(`./${global.sessions}`);
    let filesFolderPreKeys = directorio.filter(file => {
        return file.startsWith('pre-key-');
    });
    prekey = [...prekey, ...filesFolderPreKeys];
    filesFolderPreKeys.forEach(files => {
        fs.unlinkSync(`./${global.sessions}/${files}`);
    });
}

setInterval(async () => {
    if (!conn || !conn.user) return;
    await clearTmp();
    console.log(chalk.bold.cyanBright(`Archivos de la carpeta TMP no necesarios han sido eliminados del servidor.`));
}, 1000 * 60 * 4);

setInterval(async () => {
    if (!conn || !conn.user) return;
    await purgeSession();
    console.log(chalk.bold.cyanBright(`Archivos de la carpeta ${global.sessions} no necesarios han sido eliminados del servidor.`));
}, 1000 * 60 * 10);

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

setInterval(() => {
    console.log('[ ✿ ]  Reiniciando...');
    process.exit(0);
}, 10800000);

process.on('uncaughtException', console.error);
