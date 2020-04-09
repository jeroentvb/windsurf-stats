import * as scrape from 'wind-scrape'
import { WindfinderDataHour } from 'wind-scrape/dist/interfaces/windfinder'
import { Request, Response } from 'express'

async function check (req: Request, res: Response): Promise<void> {

}

async function get (req: Request, res: Response): Promise<void> {
  const { spot } = req.query

  if (!spot) {
    res.status(422).send('Incomplete query')
    return
  }

  try {
    // bug with wind-scrape
    const windfinderData = await scrape.windfinder(spot)
    const data = windfinderData.days[0].hours

    res.json(data)
  } catch (err) {
    if (err.message === 'The provided windfinder spot doesn\'t exist..') {
      console.log('OK')
      res.status(404).send(err.message)
      return
    }

    res.status(500).send()
    console.error(err)
  }
}

export default {
  check,
  get
}
