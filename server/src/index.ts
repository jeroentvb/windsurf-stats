import express from 'express'

import helmet from 'helmet'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'

import db from './services/db'
import { checkLogin, sessionStore, corsHandler, notFound } from './middleware'

import routes from './routes'

/**
 * @deprecated
 */
import oldSessions from './routes/old-sessions'

require('dotenv').config()

const mongoClient = db.init(process.env.DB_NAME as string)

express()
  /**
   * Middleware
   */
  .use(helmet())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(sessionStore(mongoClient))
  .use(corsHandler())
  .use(compression())
  .use(express.json())

  .use(checkLogin)

  /**
   * Routes
   */
  .use(routes)
  .post('/old-sessions', oldSessions.submit)

  /**
   * Route not found middleware
   */
  .use(notFound)

  /**
   * Start the server
   */
  .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
