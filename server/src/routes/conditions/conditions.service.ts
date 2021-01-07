import * as scrape from 'wind-scrape'
import { WindfinderDataHour } from 'wind-scrape/dist/interfaces/windfinder'

async function getConditions (spotName: string): Promise<WindfinderDataHour[]> {
  try {
    const windfinderData = await scrape.windfinder(spotName as string)
    return windfinderData.days[0].hours
  } catch (err) {
    throw err
  }
}

export default {
  getConditions
}
