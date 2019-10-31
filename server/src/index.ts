import express from 'express'
import session, { SessionOptions } from 'express-session'
import chalk from 'chalk'
import helmet from 'helmet'
import bodyParser from 'body-parser'
const MySQLStore = require('express-mysql-session')(session)

import * as user from './modules/user'
import * as db from './modules/db'

require('dotenv').config()

db.init()

express()
// Add middleware for checking login status
  .use(helmet())
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(session({
    store: new MySQLStore(db.dbConfig),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: process.env.COOKIE_MAX_AGE
    }
  } as SessionOptions))
  .post('/login', user.login)
  .get('/', (req, res) => res.send('working...'))
  .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
