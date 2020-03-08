import express from 'express'
import session, { SessionOptions } from 'express-session'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import chalk from 'chalk'

// const MySQLStore = require('express-mysql-session')(session)
const MongoStore = require('connect-mongo')(session);

import * as auth from './modules/auth'
import * as db from './modules/db'
import * as data from './modules/data'

require('dotenv').config()

function start () {
  express()
// Add middleware for checking login status
  .use(helmet())
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(session({
    store: new MongoStore({
      client: db.client
    }),
    resave: false,
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

  .post('/register', auth.register)
  .post('/login', auth.login)
  .post('/logout', auth.logout)
  
  .use(auth.checkLogin)

  .post('/gear', data.updateGear)

  // .get('/', (req, res) => {
  //   // console.log(req.session!.user)
  //   res.send('OK')
  // })
  // .get('/sessions', data.sessions)
  .get('/user', data.user)
  .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
}

(async function () {
  try {
    await db.init(process.env.DB_NAME as string)
    
    start()
  } catch (err) {
    throw err
  }
})()
