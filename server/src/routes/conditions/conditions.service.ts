import * as scrape from 'wind-scrape'
import { WindguruConditions } from '../../../../shared/interfaces'

async function getConditions (spotId: string): Promise<WindguruConditions[]> {
  try {
    const windguruData = await scrape.windguru(spotId as string)

    return windguruData.models.map(({ name, days }) => {
      return {
        name,
        hours: days[0].hours
      }
    })
  } catch (err) {
    throw err
  }
}

export default {
  getConditions
}
