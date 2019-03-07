const express = require('express')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const helmet = require('helmet')
const bodyParser = require('body-parser')
const chalk = require('chalk')

const db = require('./modules/db')
const user = require('./modules/user')
const data = require('./modules/data')
const render = require('./modules/render')
const api = require('./modules/api')

const config = require('./app-config.json')

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
    store: new MySQLStore(db.config),
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
  .post('/submit-data', data.submit)

  .post('/confirm-submit', data.confirm)

  .get('/preferences', render.preferences)
  .post('/set-prefs', user.preferences)
  .post('/update-prefs', user.preferences)

  .get('/account', render.account)
  .get('/api-key', api.key)
  .post('/update-email', user.updateEmail)
  .post('/change-password', user.changePassword)

  .get('/api', api.get)

  .get('/register', render.page)
  .post('/sign-up', user.register)

  .get('/login', render.page)
  .post('/sign-in', user.login)

  .get('/sign-out', user.logout)

  .use(render.notFound)
  .listen(config.port, () => console.log(chalk.green(`[Server] listening on port ${config.port}...`)))
