import express from 'express'

import helmet from 'helmet'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'

import db from './services/db'
import data from './routes/data'
import checkLogin from './middleware/check-login'
import sessionStore from './middleware/express-session'
import corsHandler from './middleware/cors'

import routes from './routes'
import { NOTFOUND } from 'dns'
import { notFound } from './middleware/not-found'

require('dotenv').config()

const mongoClient = db.init(process.env.DB_NAME as string)

express()
  .use(helmet())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(sessionStore(mongoClient))
  .use(corsHandler())
  .use(compression())
  .use(express.json())

  .use(checkLogin)

  .use(routes)
  
  

  .post('/old-sessions', data.oldSessions)

  .post('/threshold', data.updateThreshold)
  .post('/email', data.updateEmail)

  .get('/user', data.user)

  .use(notFound)

  .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
