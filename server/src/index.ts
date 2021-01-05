import express from 'express'

import helmet from 'helmet'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'

import db from './services/db'
import data from './routes/data'
import spotData from './services/spot-data'
import checkLogin from './middleware/check-login'
import sessionStore from './middleware/express-session'
import corsHandler from './middleware/cors'

import routes from './routes'

require('dotenv').config()

const app = express()
const mongoClient = db.init(process.env.DB_NAME as string)

app
  .use(helmet())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(sessionStore(mongoClient))
  .use(corsHandler())
  .use(compression())
  .use(express.json())

  .use(routes)
  
  .use(checkLogin)

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

export default express.Router()
