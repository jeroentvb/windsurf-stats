import db from '../../services/db'
import spotData from '../../services/spot'

import { Gear, Spot, User, Session } from '../../../../shared/interfaces'

async function setGear (username: string, gear: Gear): Promise<void> {
  try {
    await db.update({name: username }, { $set: {
      gear
    }})
  } catch (err) {
    throw err
  }
}

async function setSpots (username: string, newSpots: Spot[]): Promise<Spot[]> {
  try {
    const spots: Spot[] = await Promise.all(newSpots.map(async spot => {
      if (spot.windfinder === null) {
        return await spotData.check(spot)
      }

      return spot
    }))

    await db.update({ name: username }, { $set: {
      spots
    }})

    return spots
  } catch (err) {
    throw err
  }
}

async function setThreshold (username: string, threshold: number): Promise<void> {
  try {
    await db.update({name: username }, { $set: {
      threshold
    }})
  } catch (err) {
    throw err
  }
}

async function getUser (username: string): Promise<User> {
  try {
    const user: User = await getUserData(username)

    if (!user) throw new Error('no user')

    return user
  } catch (err) {
    throw err
  }
}

async function getUserData (name: string): Promise<User> {
  try {
    const userData: User[] = await db.get({ name })
    const user = userData[0]

    user.sessions = user.sessions!.sort((a, b) => {
      return (new Date(a.date) as any) - (new Date(b.date) as any)
    })

    delete user._id
    delete user.password

    return user
  } catch (err) {
    throw err
  }
}

export default {
  setGear,
  setSpots,
  setThreshold,
  getUser
}
