process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import P from 'pino';
import autopost from './plugins/tools-auto.js';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js';
import readline from 'readline';
import NodeCache from 'node-cache';
import pkg from 'google-libphonenumber';

const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser  } = await import('@whiskeysockets/baileys');
const { CONNECTING } = ws;
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

globalThis.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

globalThis.__dirname = function dirname(pathURL) {
  return path.dirname(globalThis.__filename(pathURL, true));
};

globalThis.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

globalThis.timestamp = { start: new Date };

const __dirname = globalThis.__dirname(import.meta.url);

globalThis.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
globalThis.prefix = new RegExp('^[#.!/]');

globalThis.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('datos.json'));
globalThis.DATABASE = globalThis.db;

globalThis.loadDatabase = async function loadDatabase() {
  if (globalThis.db.READ) {
    return new Promise((resolve) => setInterval(async function() {
      if (!globalThis.db.READ) {
        clearInterval(this);
        resolve(globalThis.db.data == null ? globalThis.loadDatabase() : globalThis.db.data);
      }
    }, 1 * 1000));
  }
  if (globalThis.db.data !== null) return;
  globalThis.db.READ = true;
  await globalThis.db.read().catch(console.error);
  globalThis.db.READ = null;
  globalThis.db.data = {
    users: {},
    chats: {},
    settings: {},
    ...(globalThis.db.data || {}),
  };
  globalThis.db.chain = chain(globalThis.db.data);
};
await loadDatabase();

globalThis.chatgpt = new Low(new JSONFile(path.join(__dirname, '/db/chatgpt.json')));
globalThis.loadChatgptDB = async function loadChatgptDB() {
  if (globalThis.chatgpt.READ) {
    return new Promise((resolve) =>
      setInterval(async function() {
        if (!globalThis.chatgpt.READ) {
          clearInterval(this);
          resolve(globalThis.chatgpt.data === null ? globalThis.loadChatgptDB() : globalThis.chatgpt.data);
        }
      }, 1 * 1000));
  }
  if (globalThis.chatgpt.data !== null) return;
  globalThis.chatgpt.READ = true;
  await globalThis.chatgpt.read().catch(console.error);
  globalThis.chatgpt.READ = null;
  globalThis.chatgpt.data = {
    users: {},
    ...(globalThis.chatgpt.data || {}),
  };
  globalThis.chatgpt.chain = lodash.chain(globalThis.chatgpt.data);
};
await loadChatgptDB();

globalThis.jadi = globalThis.sessions;
const { state, saveState, saveCreds } = await useMultiFileAuthState(globalThis.jadi);
const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache();
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = globalThis.botNumberCode;
const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const question = (texto) => {
  rl.clearLine(rl.input, 0);
  return new Promise((resolver) => {
    rl.question(texto, (respuesta) => {
      rl.clearLine(rl.input, 0);
      resolver(respuesta.trim());
    });
  });
};

let opcion;
if (methodCodeQR) {
  opcion = '1';
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${sessions}/creds.json`)) {
  do {
    opcion = await question('🌱 Seleccione una opción:\n1. Conexión mediante código QR.\n2. Conexión mediante código de 8 dígitos.\n---> ');
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright(`No se permiten números que no sean 1 o 2, tampoco letras o símbolos especiales.`));
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${sessions}/creds.json`));
}

const filterStrings = [
  "Q2xvc2luZyBzdGFsZSBvcGVu",
  "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
  "RmFpbGVkIHRvIGRlY3J5cHQ=",
  "U2Vzc2lvbiBlcnJvcg==",
  "RXJyb3I6IEJhZCBNQUM=",
  "RGVjcnlwdGVkIG1lc3NhZ2U="
];

console.info = () => {};
console.debug = () => {};
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings));

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: opcion == '1' ? ['WaBot', 'Edge', '20.0.04'] : methodCodeQR ? ['WaBot', 'Edge', '20.0.04'] : ["Ubuntu", "Opera", "20.0.04"],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => {
    try {
      let jid = jidNormalizedUser (key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    } catch (error) {
      return "";
    }
  },
  msgRetryCounterCache: msgRetryCounterCache || new Map(),
  userDevicesCache: userDevicesCache || new Map(),
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
  version: version,
  keepAliveIntervalMs: 55000,
  maxIdleTimeMs: 60000,
};

globalThis.conn = makeWASocket(connectionOptions);

if (!fs.existsSync(`./${sessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {
      let addNumber;
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '');
      } else {
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`🌹 Por favor ingrese el número de WhatsApp\n${chalk.bold.magentaBright('---> ')}`)));
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
          console.log(chalk.bold.white(chalk.bgMagenta('🏝️ Código de vinculación :')), chalk.bold.white(chalk.white(codeBot)));
        }, 2000);
      }
    }
  }
}

conn.isInit = false;
conn.well = false;
conn.logger.info(`🌷 Iniciando . . .\n`);

if (!opts['test']) {
  if (globalThis.db) {
    setInterval(async () => {
      if (globalThis.db.data) await globalThis.db.write();
      if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', 'Data/Sesiones/Subbots'], tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])));
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

// Resto de la lógica del bot...
