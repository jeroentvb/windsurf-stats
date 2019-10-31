import express from 'express'
import chalk from 'chalk'

require('dotenv').config()

const app = express()

app
  .get('/', (req, res) => res.send('working...'))
  .listen(process.env.PORT, () => chalk.green(`[server] listening on port ${process.env.PORT}`))
