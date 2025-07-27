console.log('✯ Iniciando FNBOT-MD ✯')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'

import path, { join, dirname } from 'path'

import { createRequire } from 'module'

import { fileURLToPath } from 'url'

import cfonts from 'cfonts'

import chalk from 'chalk'

import { watchFile, unwatchFile, readdirSync, existsSync, readFileSync, watch } from 'fs'

import syntaxerror from 'syntax-error'

import { format } from 'util'

import { Boom } from '@hapi/boom'

import { Low, JSONFile } from 'lowdb'

import lodash from 'lodash'

import yargs from 'yargs'

import readline from 'readline'

import NodeCache from 'node-cache'

import P from 'pino'

import { makeWASocket, protoType, serialize } from './lib/simple.js'

import store from './lib/store.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const require = createRequire(__dirname)

cfonts.say('Chika\nFujiwara', {

  font: 'chrome',

  align: 'center',

  gradient: ['red', 'magenta']

})

cfonts.say(`Developed Ricardo`, {

  font: 'console',

  align: 'center',

  gradient: ['red', 'magenta']

})

protoType()

serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = process.platform !== 'win32') {

  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathURL

}

global.__dirname = function dirname(pathURL) {

  return path.dirname(global.__filename(pathURL, true))

}

global.__require = function require(dir = import.meta.url) {

  return createRequire(dir)

}

global.timestamp = { start: new Date }

const __dirname2 = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

global.db = new Low(new JSONFile(`storage/databases/database.json`))

global.DATABASE = global.db

global.loadDatabase = async function loadDatabase() {

  if (global.db.READ) return new Promise((resolve) => setInterval(async function () {

    if (!global.db.READ) {

      clearInterval(this)

      resolve(global.db.data == null ? global.loadDatabase() : global.db.data)

    }

  }, 1 * 1000))

  if (global.db.data !== null) return

  global.db.READ = true

  await global.db.read().catch(console.error)

  global.db.READ = null

  global.db.data = {

    users: {},

    chats: {},

    stats: {},

    msgs: {},

    sticker: {},

    settings: {},

    ...(global.db.data || {})

  }

  global.db.chain = lodash.chain(global.db.data)

}

await global.loadDatabase()

global.authFile = `sessions`

const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, DisconnectReason } = await import('@whiskeysockets/baileys')

const { state, saveState, saveCreds } = await useMultiFileAuthState(`${global.authFile}`)

const msgRetryCounterCache = new NodeCache()

const { version } = await fetchLatestBaileysVersion()

const useMobile = false

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

const connectionOptions = {

  version,

  logger: P({ level: "fatal" }).child({ level: "fatal" }),

  printQRInTerminal: false,

  mobile: useMobile,

  browser: ['Mac OS', 'chrome', '121.0.6167.159'],

  auth: {

    creds: state.creds,

    keys: makeCacheableSignalKeyStore(state.keys, P({ level: "fatal" }).child({ level: "fatal" })),

  },

  generateHighQualityLinkPreview: true,

  getMessage: async (key) => {

    let jid = jidNormalizedUser(key.remoteJid)

    let msg = await store.loadMessage(jid, key.id)

    return msg?.message || ""

  },

  msgRetryCounterCache,

  defaultQueryTimeoutMs: undefined,

}

global.conn = makeWASocket(connectionOptions)

if (!conn.authState.creds.registered) {

  let phoneNumber = await question(chalk.blue('Ingresa el número de WhatsApp en el cual estará la Bot\n'))

  phoneNumber = phoneNumber.replace(/\D/g, '')

  if (phoneNumber.startsWith('52') && phoneNumber.length === 12) {

    phoneNumber = `521${phoneNumber.slice(2)}`

  } else if (phoneNumber.startsWith('52')) {

    phoneNumber = `521${phoneNumber.slice(2)}`

  } else if (phoneNumber.startsWith('0')) {

    phoneNumber = phoneNumber.replace(/^0/, '')

  }

  if (conn.requestPairingCode) {

    let code = await conn.requestPairingCode(phoneNumber)

    code = code?.match(/.{1,4}/g)?.join("-") || code

    console.log(chalk.cyan(`Su código es: ${code}`))

  }

}

conn.isInit = false

conn.well = false

function clearTmp() {

  const tmp = [join(__dirname2, './tmp')]

  const filename = []

  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))))

  return filename.map((file) => {

    try {

      const stats = statSync(file)

      if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) return unlinkSync(file)

      return false

    } catch (e) { }

  })

}

setInterval(async () => {

  if (!conn || !conn.user) return

  await clearTmp()

}, 180000)

async function connectionUpdate(update) {

  const { connection, lastDisconnect, isNewLogin } = update

  global.stopped = connection

  if (isNewLogin) conn.isInit = true

  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {

    await global.reloadHandler(true).catch(console.error)

    global.timestamp.connect = new Date

  }

  if (global.db.data == null) await global.loadDatabase()

  if (connection == 'open') {

    console.log(chalk.yellow('Conectado correctamente.'))

  }

  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode

  if (reason == 405) {

    try { unlinkSync("./sessions/" + "creds.json") } catch { }

    console.log(chalk.bold.redBright(`Conexión replazada, Por favor espere un momento me voy a reiniciar...\nSi aparecen error vuelve a iniciar con : npm start`))

    process.send('reset')

  }

  if (connection === 'close') {

    if (reason === DisconnectReason.badSession) {

      conn.logger.error(`Sesión incorrecta, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`)

    } else if (reason === DisconnectReason.connectionClosed) {

      conn.logger.warn(`Conexión cerrada, reconectando...`)

      await global.reloadHandler(true).catch(console.error)

    } else if (reason === DisconnectReason.connectionLost) {

      conn.logger.warn(`Conexión perdida con el servidor, reconectando...`)

      await global.reloadHandler(true).catch(console.error)

    } else if (reason === DisconnectReason.connectionReplaced) {

      conn.logger.error(`Conexión reemplazada, se ha abierto otra nueva sesión. Por favor, cierra la sesión actual primero.`)

    } else if (reason === DisconnectReason.loggedOut) {

      conn.logger.error(`Conexion cerrada, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`)

    } else if (reason === DisconnectReason.restartRequired) {

      conn.logger.info(`Reinicio necesario, reinicie el servidor si presenta algún problema.`)

      await global.reloadHandler(true).catch(console.error)

    } else if (reason === DisconnectReason.timedOut) {

      conn.logger.warn(`Tiempo de conexión agotado, reconectando...`)

      await global.reloadHandler(true).catch(console.error)

    } else {

      conn.logger.warn(`Razón de desconexión desconocida. ${reason || ''}: ${connection || ''}`)

      await global.reloadHandler(true).catch(console.error)

    }

  }

}

process.on('uncaughtException', console.error)

let isInit = true

let handler = await import('./handler.js')

global.reloadHandler = async function (restatConn) {

  try {

    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)

    if (Object.keys(Handler || {}).length) handler = Handler

  } catch (e) {

    console.error(e)

  }

  if (restatConn) {

    const oldChats = global.conn.chats

    try { global.conn.ws.close() } catch { }

    conn.ev.removeAllListeners()

    global.conn = makeWASocket(connectionOptions, { chats: oldChats })

    isInit = true

  }

  if (!isInit) {

    conn.ev.off('messages.upsert', conn.handler)

    conn.ev.off('connection.update', conn.connectionUpdate)

    conn.ev.off('creds.update', conn.credsUpdate)

  }

  conn.handler = handler.handler.bind(global.conn)

  conn.connectionUpdate = connectionUpdate.bind(global.conn)

  conn.credsUpdate = saveCreds.bind(global.conn, true)

  conn.ev.on('messages.upsert', conn.handler)

  conn.ev.on('connection.update', conn.connectionUpdate)

  conn.ev.on('creds.update', conn.credsUpdate)

  isInit = false

  return true

}

const pluginFolder = global.__dirname(join(__dirname2, './plugins/index'))

const pluginFilter = filename => /\.js$/.test(filename)

global.plugins = {}

async function filesInit() {

  for (let filename of readdirSync(pluginFolder).filter(pluginFilter)) {

    try {

      let file = global.__filename(join(pluginFolder, filename))

      const module = await import(file)

      global.plugins[filename] = module.default || module

    } catch (e) {

      conn.logger.error(e)

      delete global.plugins[filename]

    }

  }

}

filesInit().catch(console.error)

global.reload = async (_ev, filename) => {

  if (pluginFilter(filename)) {

    const dir = global.__filename(join(pluginFolder, filename), true)

    if (filename in global.plugins) {

      if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`)

      else {

        conn.logger.warn(`deleted plugin - '${filename}'`)

        return delete global.plugins[filename]

      }

    } else conn.logger.info(`new plugin - '${filename}'`)

    const err = syntaxerror(readFileSync(dir), filename, {

      sourceType: 'module',

      allowAwaitOutsideFunction: true,

    })

    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)

    else {

      try {

        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))

        global.plugins[filename] = module.default || module

      } catch (e) {

        conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)

      } finally {

        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))

      }

    }

  }

}

Object.freeze(global.reload)

watch(pluginFolder, global.reload)

await global.reloadHandler()