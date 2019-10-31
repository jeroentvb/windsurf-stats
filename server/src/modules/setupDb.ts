import chalk from 'chalk'
import mysql, { ConnectionConfig } from 'mysql'
require('dotenv').config()

var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
} as ConnectionConfig)

db.connect(err => {
  if (err) throw err
  console.log(chalk.green('[MySql] connection established..'))
})

function createDb () {
  return new Promise((resolve, reject) => {
    db.query('CREATE DATABASE IF NOT EXISTS windsurfStatistics', err => {
      if (err) {
        reject(err)
      } else {
        console.log(chalk.yellow('[MySql] Database created'))
        resolve()
      }
    })
  })
}

function createTable (query: string, tableName: string) {
  return new Promise((resolve, reject) => {
    db.query(query, err => {
      if (err) {
        reject(err)
      } else {
        console.log(chalk.yellow(`[MySql] ${tableName} table created`))
        resolve()
      }
    })
  })
}

const queries = {
  statistics: `CREATE TABLE IF NOT EXISTS windsurfStatistics.statistics(statisticId int NOT NULL AUTO_INCREMENT,
    userId INT, date VARCHAR(10), spot VARCHAR(100), windspeed INT, windgust INT, windDirection VARCHAR(30),
    sailSize FLOAT, board VARCHAR(30), rating FLOAT, note VARCHAR(255), PRIMARY KEY (statisticId))`,
  users: `CREATE TABLE IF NOT EXISTS windsurfStatistics.users(id int NOT NULL AUTO_INCREMENT,
    username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id))`,
  gear: `CREATE TABLE IF NOT EXISTS windsurfStatistics.gear(id int NOT NULL AUTO_INCREMENT, userId INT,
    board0 VARCHAR(255), board1 VARCHAR(255), board2 VARCHAR(255), board3 VARCHAR(255), board4 VARCHAR(255),
    sail0 VARCHAR(255), sail1 VARCHAR(255), sail2 VARCHAR(255), sail3 VARCHAR(255), sail4 VARCHAR(255),
    sail5 VARCHAR(255), sail6 VARCHAR(255), sail7 VARCHAR(255), sail8 VARCHAR(255), sail9 VARCHAR(255),
    spot0 VARCHAR(255), spot1 VARCHAR(255), spot2 VARCHAR(255), spot3 VARCHAR(255), spot4 VARCHAR(255),
    PRIMARY KEY(id))`
}

Promise.all([
  createDb(),
  createTable(queries.statistics, 'statistics'),
  createTable(queries.users, 'users'),
  createTable(queries.gear, 'gear')
])
  .then(() => {
    console.log(chalk.green('[MySql] Database set up succesfully'))
    db.end()
  })
  .catch(err => {
    console.error(err)
    db.query('DROP DATABASE windsurfStatistics', error => {
      if (error) {
        console.error(chalk.red('Database could not be reset'))
        throw error
      } else {
        console.error(chalk.yellow('Database was reset because of the following error:'))
        throw err
      }
    })
  })
