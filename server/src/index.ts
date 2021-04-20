import express from 'express'

import helmet from 'helmet'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'

import db from './services/db'
import { checkLogin, sessionStore, corsHandler, notFound } from './middleware'

import routes from './routes'

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

  /**
   * Check if the user is and needs to be logged in
   */
  .use(checkLogin)

  /**
   * Routes
   */
  .use(routes)

  /**
   * Route not found middleware
   */
  .use(notFound)

  /**
   * Start the server
   */
  .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
