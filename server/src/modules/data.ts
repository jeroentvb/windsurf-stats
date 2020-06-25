import { Request, Response } from 'express'
import * as db from './db'
import * as auth from './auth'
import spotData from './spot-data'

import { User } from '../../../shared/interfaces/User'
import { Gear } from '../../../shared/interfaces/Gear'
import { Spot } from '../../../shared/interfaces/Spot'
import { Session } from '../../../shared/interfaces/Session'

async function getUserData (name: string): Promise<User> {
  try {
    const userData: User[] = await db.get({ name })
    const user = userData[0]
    user.sessions = sortSessions(user.sessions as Session[])

    delete user._id
    delete user.password

    return user
  } catch (err) {
    throw err
  }
}

function sortSessions (sessions: Session[]) {
  return sessions.sort((a, b) => {
    return (new Date(a.date) as any) - (new Date(b.date) as any)
  })
}

async function user (req: Request, res: Response) {
  if (!req.session!.user) {
    res.status(401).send()
    return
  }

  try {
    const user: User = await getUserData(req.session!.user.name)

    if (!user) {
      auth.logout(req, res)
      return
    }

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

async function updateThreshold (req: Request, res: Response) {
  const threshold: number = req.body.threshold
  const user = req.session!.user

  try {
    await db.update({name: user.name }, { $set: {
      threshold
    }})

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
  session,
  updateThreshold
}
