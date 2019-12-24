import express from 'express'
import session, { SessionOptions } from 'express-session'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import chalk from 'chalk'

const MySQLStore = require('express-mysql-session')(session)

import * as user from './modules/user'
import * as db from './modules/db'
import * as data from './modules/data'

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
    resave: true,
    saveUninitialized: false,
    rolling: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: parseInt(<string>process.env.COOKIE_MAX_AGE)
    }
  } as SessionOptions))
  .use(cors({
    origin: 'http://localhost:8080',
    credentials: true
  }))
  .use(express.json())
  .post('/login', user.login)
  .post('/logout', user.logout)

  .use(user.checkLogin)

  .get('/', (req, res) => {
    // console.log(req.session!.user)
    res.send('OK')
  })
  .get('/sessions', data.sessions)
  .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
