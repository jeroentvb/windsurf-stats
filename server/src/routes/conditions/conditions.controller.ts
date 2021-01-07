import { Request, Response } from 'express'
import conditionsService from './conditions.service'

async function get (req: Request, res: Response) {  
  try {
    const spotName: string = req.query.spot as string

    if (!spotName) {
      res.status(422).send('Incomplete query')
      return
    }

    const conditions = await conditionsService.getConditions(spotName)

    res.json(conditions)
  } catch (err) {
    if (err.message === 'The provided windfinder spot doesn\'t exist..') {
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
