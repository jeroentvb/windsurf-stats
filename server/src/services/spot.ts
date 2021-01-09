import * as scrape from 'wind-scrape'
import { Spot } from '../../../shared/interfaces/Spot'

async function check (spot: Spot): Promise<Spot> {
  try {
    await scrape.windguru(spot.id)

    return {
      ...spot,
      windguru: true
    }
  } catch (err) {
    return {
      ...spot,
      windguru: false
    }
  }
}

export default {
  check
}
