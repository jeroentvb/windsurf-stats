import db from '../../services/db'
import spotData from '../../services/spot'

import { Gear } from '../../../../shared/interfaces/Gear'
import { Spot } from '../../../../shared/interfaces/Spot'

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

export default {
  setGear,
  setSpots
}
