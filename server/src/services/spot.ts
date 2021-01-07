import * as scrape from 'wind-scrape'
import { Spot } from '../../../shared/interfaces/Spot'

async function check (spot: Spot): Promise<Spot> {
  try {
    await scrape.windfinder(spot.id)
    return Object.assign(spot, { windfinder: true })
  } catch (err) {
    return Object.assign(spot, { windfinder: false })
  }
}

export default {
  check
}
