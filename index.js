const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const helmet = require('helmet')
const bodyParser = require('body-parser')

const db = require('./modules/db')
const user = require('./modules/user')
const data = require('./modules/data')
const render = require('./modules/render')
const api = require('./modules/api')

const config = require('./app-config.json')

const chalk = require('chalk')

require('dotenv').config()

db.init()

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(helmet())
  .use(express.static('static'))
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(session({
    store: new FileStore(),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: config.cookieMaxAge
    }
  }))
  .get('/', render.page)
  .get('/statistics', render.page)
  .get('/all-stats', render.allStatistics)
  .get('/data', data.send)
  .get('/add-session', render.addSession)
  .get('/register', render.page)
  .get('/preferences', render.preferences)
  .post('/set-prefs', user.preferences)
  .post('/update-prefs', user.preferences)
  .get('/account', user.accountDetails)
  .post('/update-email', user.updateEmail)
  .post('/change-password', user.changePassword)
  .get('/login', render.page)
  .post('/sign-up', user.register)
  .post('/sign-in', user.login)
  .get('/sign-out', user.logout)
  .post('/submit-data', data.submit)
  .post('/confirm-submit', data.confirm)
  .get('/api', api.get)
  .get('/api-key', api.key)
  .use(render.notFound)
  .listen(config.port, () => console.log(chalk.green(`[Server] listening on port ${config.port}...`)))
