import bcrypt from 'bcrypt'

import * as db from './db'

import { Request, Response, NextFunction } from 'express';
import { User } from '../../../shared/interfaces/User';

require('dotenv').config()

export function checkLogin (req: Request, res: Response, next: NextFunction) {
  if (!req.session!.user) {
    res.status(401).send()
  } else {
    next()
  }
}

export async function register (req: Request, res: Response) {
  if (process.env.ALLOW_REGISTER === 'false') {
    res.status(403).send()
    return
  }

  const user: User = req.body

  if (!user.email || !user.password || !user.name) {
    res.status(422).send('Missing username, email or password')
    return
  }

  try {
    const userData = await db.get({$or: [
      { name: user.name },
      { email: user.email }
    ]})

    if (userData.length > 0) {
      res.status(409).send('Username or email is already used')
      return
    }

    const hash = await createHash(user.password)

    const { insertedId } = await db.insert({
      name: user.name,
      email: user.email,
      password: hash,
      gear: {
        boards: [],
        sails: []
      },
      spots: [],
      sessions: [],
      threshold: 5
    })

    req.session!.user = {
      name: user.name,
      email: user.email
    }

    res.send()

  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

export async function login (req: Request, res: Response) {
  const user: User = req.body

  if (!user.name || !user.password) {
    res.status(422).send('Missing username or password')
    return
  }

  try {
    const userData = await db.get({ name: user.name })

    if (!userData[0]) {
      res.status(422).send('Missing username or password')
      return
    }

    const { password } = userData[0]
    const match = await compareHash(user.password, password!)

    if (!match) {
      res.status(401).send('Incorrect username or password')
      return
    }

    req.session!.user = {
      name: user.name,
      email: user.email
    }

    res.status(200).send()
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

export function logout (req: Request, res: Response) {
  req.session!.destroy(err => {
    if (err) {
      console.error(err)
      res.status(500).send()
      return
    }
    
    res.send()
  })
}

export async function userIsAuthenticated (username: string, password: string): Promise<boolean> {
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
