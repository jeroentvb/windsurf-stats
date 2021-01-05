import { Request, Response } from 'express'
import { Gear } from '../../../../shared/interfaces/Gear'
import { Spot } from '../../../../shared/interfaces/Spot'
import userDataService from './user-data.service'

async function updateGear (req: Request, res: Response) {
  const gear: Gear = req.body
  const { name } = req.session!.user

  try {
    await userDataService.setGear(name, gear)
    
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

async function updateSpots (req: Request, res: Response) {
  const newSpots: Spot[] = req.body
  const { name } = req.session!.user

  try {
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
