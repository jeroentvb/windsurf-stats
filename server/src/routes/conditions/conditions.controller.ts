import { Request, Response } from 'express'
import conditionsService from './conditions.service'

async function get (req: Request, res: Response) {  
  try {
    const spotId: string = req.query.spot as string

    if (!spotId) {
      res.status(422).send('Incomplete query')
      return
    }

    const models = await conditionsService.getConditions(spotId)

    res.json(models)
  } catch (err) {
    if (err.message === 'the provided windfinder spot doesn\'t exist..') {
      res.status(404).send(err.message)
      return
    }

    res.status(500).send()
    console.error(err)
  }
}

export default {
  get
}
