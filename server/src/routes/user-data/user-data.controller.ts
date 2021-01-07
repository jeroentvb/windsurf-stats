import { Request, Response } from 'express'
import { Gear } from '../../../../shared/interfaces/Gear'
import { Spot } from '../../../../shared/interfaces/Spot'
import userDataService from './user-data.service'

async function updateGear (req: Request, res: Response) {
  try {
    const gear: Gear = req.body
    const { name } = req.session!.user

    await userDataService.setGear(name, gear)
    
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

async function updateSpots (req: Request, res: Response) {
  try {
    const newSpots: Spot[] = req.body
    const { name } = req.session!.user

    const spots = await userDataService.setSpots(name, newSpots)
    
    res.json(spots)
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

export default {
  updateGear,
  updateSpots
}
