import bcrypt from 'bcrypt'

import * as db from './db'

import { Request, Response, NextFunction } from "express";

require('dotenv').config()

export function checkLogin (req: Request, res: Response, next: NextFunction) {
  console.log(req.session!.user)
  if (!req.session!.user) {
    res.status(401).send()
  } else {
    next()
  }
}

export async function login (req: Request, res: Response) {
  const username: string = req.body.username
  const password: string = req.body.password

  if (!username || !password) {
    res.status(400).send({
      error: '400',
      msg: 'Username or password is missing!'
    })
    return
  }

  try {
    const userData = await db.query('SELECT * FROM windsurfStatistics.users WHERE username = ?', username)
    const user = userData && userData[0]

    if (!user) {
      res.status(401).send({
        error: '401',
        msg: 'Incorrect e-mail or password.'
      })
      return
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      res.status(401).send({
        error: '401',
        msg: 'Incorrect password.'
      })
      return
    }

    req.session!.user = {
      name: user.username,
      id: user.id,
      email: user.email
    }

    res.status(200).send()
  } catch (err) {
    console.error(err)
    // render.unexpectedError(res)
  }
}

export async function logout (req: Request, res: Response) {
  console.log(req.session)
  delete req.session!.user
  req.session!.destroy(err => {
    if (err) return console.error(err)
    
    res.status(200).end()
  })
  res.end()
}
