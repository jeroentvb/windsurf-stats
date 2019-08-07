const express = require('express')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const helmet = require('helmet')
const bodyParser = require('body-parser')
const chalk = require('chalk')

const db = require('./modules/db')
const render = require('./modules/render')
const user = require('./modules/user')

const config = require('./app-config.json')

require('dotenv').config()

db.init()

module.exports = express()
  .use((req, res, next) => {
    res.setHeader('Cache-Control', 'max-age=' + 30 * 24 * 60 * 60)
    next()
  })
  .set('view engine', 'ejs')
  .set('views', 'templates/pages')
  .use(helmet())
  .use(express.static('public'))
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

  .get('/login', render.login)
  .post('/sign-in', user.login)

  .get('/register', render.register)
  .post('/sign-up', user.register)
  .post('/set-gear', user.setGear)

  .get('/sign-out', user.logout)

  .use((req, res, next) => {
    if (!req.session.user) res.redirect('/login')
    next()
  })

  .get('/set-gear', (req, res) => {
    res.render('set-gear', {
      page: 'Set gear'
    })
  })

  .get('/', render.statistics)
  .get('/statistics', render.statistics)

  .use(render.notFound)
  .listen(config.port, () => console.log(chalk.green(`[Server] listening on port ${config.port}...`)))
