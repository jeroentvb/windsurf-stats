import { Request, Response } from "express"
import * as db from './db'

import { Session } from '../interfaces/session'
import { User } from '../interfaces/user'

export async function sessions (req: Request, res: Response) {
  try {
    const result: Session[] = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session!.user.id)
    const data = result.map((session: Session) => {
      delete session.statisticId
      delete session.userId

      return session
    })

    res.json(data)
  } catch (err) {
    res.status(500).send(err)
  }
}

export async function user (req: Request, res: Response) {
  if (!req.session!.user) {
    res.status(401).send()
  }

  console.log(req.session!.user.id)

  try {
    const userData: User[] = await db.get(req.session!.user.id)
    const user = userData[0]

    delete user._id
    delete user.password

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}
