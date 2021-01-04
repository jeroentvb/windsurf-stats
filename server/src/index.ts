import express from 'express'
import session, { SessionOptions } from 'express-session'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'
import mongo from 'connect-mongo'

import auth from './routes/auth/auth.controller'
import db, { client } from './services/db'
import data from './routes/data'
import spotData from './services/spot-data'

require('dotenv').config()

const app = express()
const MongoStore = mongo(session)

function start () {
  app
    .use(helmet())
    .use(bodyParser.urlencoded({
      extended: true
    }))
    .use(session({
      store: new MongoStore({
        client: client
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
    .use(compression())
    .use(express.json())
    
    .use(auth.checkLogin)

    .post('/gear', data.updateGear)
    .post('/spots', data.updateSpots)

    .post('/session', data.session)
    .patch('/session', data.updateSession)
    .post('/old-sessions', data.oldSessions)

    .post('/check-spot', spotData.check)
    .get('/conditions', spotData.get)

    .post('/threshold', data.updateThreshold)
    .post('/email', data.updateEmail)

    .get('/user', data.user)
    .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
}

(async function () {
  try {
    await db.init(process.env.DB_NAME as string)
    
    start()
  } catch (err) {
    console.error(chalk.red('Could not initialize the database connection'))
    throw err
  }
})()

export default app
