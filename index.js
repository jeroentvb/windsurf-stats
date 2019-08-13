const express = require('express')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const helmet = require('helmet')
const bodyParser = require('body-parser')
const chalk = require('chalk')

const db = require('./modules/db')
const render = require('./modules/render')
const user = require('./modules/user')
const api = require('./modules/api')

const config = require('./app-config.json')

require('dotenv').config()

db.init()

module.exports = express()
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
  .post('/set-gear', user.gear.set)

  .get('/sign-out', user.logout)

  .use(user.checkLogin)

  .get('/', render.statistics)
  .get('/statistics', render.statistics)

  .get('/sessions', api.send.sessions)

  .get('/gear', render.gear)
  .post('/update-gear', user.gear.update)

  .get('/add-session', render.addSession)
  .post('/submit-session', user.session.submit)
  // .post('/confirm-session', user.session.confirm)

  .get('/account', render.account)

  .post('/change-password', user.change.password)
  .post('/change-email', user.change.email)
  // .post('/delete-account', user.remove)

  // .get('/profile', render.profile)
  // .get('/profile/:user', render.profile)

  // .get('/set-gear', (req, res) => {
  //   res.render('set-gear', {
  //     page: 'Set gear'
  //   })
  // })

  .use(render.notFound)
  .listen(config.port, () => console.log(chalk.green(`[Server] listening on port ${config.port}...`)))
