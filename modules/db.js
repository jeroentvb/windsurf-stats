const mysql = require('mysql')
const chalk = require('chalk')
const bcrypt = require('bcrypt')
const config = require('../app-config.json')

require('dotenv').config()

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

let database

function init () {
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

function query (query, params) {
  return new Promise((resolve, reject) => {
    database.query(query, params, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

function hashPassword (password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, config.saltRounds, (err, hash) => {
      if (err) reject(err)
      resolve(hash)
    })
  })
}

function createUser (user) {
  return new Promise(async (resolve, reject) => {
    try {
      const hash = await hashPassword(user.password)
      const result = await query('INSERT INTO windsurfStatistics.users SET ?', {
        username: user.name,
        email: user.email,
        password: hash
      })
      const userId = result.insertId

      resolve(userId)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  config: dbConfig,
  init,
  query,
  createUser
}
