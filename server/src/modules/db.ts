import mysql, { ConnectionConfig, Connection } from 'mysql'
import chalk from 'chalk'

import * as helper from './helper'

import { User } from '../interfaces/user'

require('dotenv').config()

export const dbConfig: ConnectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

let database: Connection

export function init () {
  console.log(chalk.green('[MySql] trying to connect..'))

  database = mysql.createConnection(dbConfig)

  database.connect(err => {
    if (err) {
      console.error('[MySql] error while connecting to the db:', err)
      setTimeout(init, 10000)
    } else {
      console.log(chalk.green('[MySql] connection established..'))
    }
  })

  // Handle db errors
  database.on('error', err => {
    console.error('[MySql] db error:', err)

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      init()
    } else {
      throw err
    }
  })
}

export function query (query: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    database.query(query, params, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

export function createUser (user: User): Promise<string | number> {
  return new Promise(async (resolve, reject) => {
    try {
      const hash = await helper.hashPassword(user.password!)
      const result = await query('INSERT INTO windsurfStatistics.users SET ?', {
        username: user.username,
        email: user.email,
        password: hash
      } as User)
      const userId = result.insertId

      resolve(userId)
    } catch (err) {
      reject(err)
    }
  })
}
