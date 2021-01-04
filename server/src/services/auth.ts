import bcrypt from 'bcrypt'

import db from './db'

require('dotenv').config()

async function userIsAuthenticated (username: string, password: string): Promise<boolean> {
  try {
    const userData = await db.get({ name: username })

    if (!userData[0]) {
      throw new Error('User not found')
    }

    return await compareHash(password, userData[0].password as string)
  } catch (err) {
    throw err
  }
}

function createHash (string: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(string, parseInt(process.env.SALT_ROUNDS as string), (err, hash) => {
      if (err) reject(err)
      resolve(hash)
    })
  })
}

function compareHash (password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

export default {
  userIsAuthenticated,
  createHash,
  compareHash
}
