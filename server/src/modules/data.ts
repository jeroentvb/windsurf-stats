import { Request, Response } from "express"
import * as db from './db'

import { Session } from '../interfaces/session'

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
