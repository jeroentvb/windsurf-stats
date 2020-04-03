import * as scrape from 'wind-scrape'
import { WindfinderDataHour } from 'wind-scrape/dist/interfaces/windfinder'
import { Request, Response } from 'express'

async function check (req: Request, res: Response): Promise<void> {

}

async function get (req: Request, res: Response): Promise<void> {
  const spot = req.params.spot

  try {
    const windfinderData = await scrape.windfinder(spot)
    const data = windfinderData.days[0].hours

    res.json(data)
  } catch (err) {
    res.status(500).send()
    console.error(err)
  }
}

export default {
  check,
  get
}
