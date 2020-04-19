import { Request, Response } from 'express'
import * as db from './db'
import * as auth from './auth'
import spotData from './spot-data'

import { User } from '../../../shared/interfaces/User'
import { Gear } from '../../../shared/interfaces/Gear'
import { Spot } from '../../../shared/interfaces/Spot'
import { Session } from '../../../shared/interfaces/Session'

// export async function sessions (req: Request, res: Response) {
//   try {
//     const result: Session[] = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session!.user.id)
//     const data = result.map((session: Session) => {
//       delete session.statisticId
//       delete session.userId

//       return session
//     })

//     res.json(data)
//   } catch (err) {
//     res.status(500).send(err)
//   }
// }

async function user (req: Request, res: Response) {
  if (!req.session!.user) {
    res.status(401).send()
    return
  }

  try {
    const userData: User[] = await db.get(req.session!.user.id)
    const user = userData[0]

    if (!user) {
      auth.logout(req, res)
      return
    }

    delete user._id
    delete user.password

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

async function updateGear (req: Request, res: Response) {
  const gear: Gear = req.body
  const user = req.session!.user

  try {
    await db.update({name: user.name }, { $set: {
      gear
    }})
    
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

// Update user spot data
async function updateSpots (req: Request, res: Response) {
  const newSpots: Spot[] = req.body
  const user = req.session!.user

  try {
    const spots: Spot[] = await Promise.all(newSpots.map(async spot => {
      if (spot.windfinder === null) {
        return await spotData.check(spot)
      }

      return spot
    }))

    await db.update({ name: user.name }, { $set: {
      spots
    }})
    
    res.json(spots)
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

async function session (req: Request, res: Response) {
  const user = req.session!.user
  const session: Session = req.body

  try {
    await db.update({ name: user.name }, { $push: { sessions: session } })

    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

export default {
  user,
  updateGear,
  updateSpots,
  session
}
