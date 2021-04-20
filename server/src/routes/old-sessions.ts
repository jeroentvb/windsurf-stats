import { Request, Response } from 'express'
import db from '../services/db'

import { Session } from '../../../shared/interfaces/Session'

/**
 * @deprecated
 */
interface oldSession {
  date: string
  spot: string
  windspeed: number
  windgust: number
  windDirection: string
  sailSize: 3.5
  board: string
  rating: number
  note: string
}

/**
 * @deprecated
 */
async function submit (req: Request, res: Response) {
  try {
    const sessions: Session[] = req.body.map((session: oldSession) => parseToNewSessionFormat(session))
    const user = req.session!.user

    await db.update({ name: user.name }, { $push: { sessions: { $each: sessions } } })

    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

function parseToNewSessionFormat (session: oldSession): Session {
  return {
    date: new Date(session.date.split('-').reverse().join('-')).toISOString(),
    time: {
      start: 0,
      end: 0
    },
    spot: session.spot,
    gear: {
      sail: session.sailSize.toString(),
      board: session.board
    },
    conditions: {
      windspeed: session.windspeed,
      windgust: session.windgust,
      winddirection: windToDegrees(session.windDirection), // Do some magic math here
      temperature: 0
    },
    rating: session.rating,
    note: session.note
  }
}

function windToDegrees (direction: string): number {
  switch (direction) {
    case 'N':
      return 0
    case 'NNE':
    case 'NNO':
      return 22.5
    case 'NE':
    case 'NO':
      return 45
    case 'ENE':
    case 'ONO':
      return 67.5
    case 'E':
    case 'O':
      return 90
    case 'ESE':
    case 'OZO':
      return 112.5
    case 'SE':
    case 'ZO':
      return 135
    case 'SSE':
    case 'ZZO':
      return 157.5
    case 'S':
    case 'Z':
      return 180
    case 'SSW':
    case 'ZZW':
      return 202.5
    case 'SW':
    case 'ZW':
      return 225
    case 'WSW':
    case 'WZW':
      return 247.5
    case 'W':
      return 270
    case 'WNW':
      return 292.5
    case 'NW':
      return 315
    case 'NNW':
      return 337.5
    default:
      return 0
  }
}

export default {
  submit
}
