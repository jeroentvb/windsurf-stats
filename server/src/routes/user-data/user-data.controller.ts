import { Request, Response } from 'express'

import userDataService from './user-data.service'

import { Gear } from '../../../../shared/interfaces/Gear'
import { Spot } from '../../../../shared/interfaces/Spot'

async function updateGear (req: Request, res: Response) {
  try {
    const gear: Gear = req.body
    const name: string = req.session!.user.name

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
    const name: string = req.session!.user.name

    const spots = await userDataService.setSpots(name, newSpots)
    
    res.json(spots)
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

async function updateThreshold (req: Request, res: Response) {
  try {
    const threshold: number = req.body.payload
    const name: string = req.session!.user.name

    await userDataService.setThreshold(name, threshold)

    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

async function getUser (req: Request, res: Response) {
  try {
    const name: string = req.session!.user.name
    const user = await userDataService.getUser(name)

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

export default {
  updateGear,
  updateSpots,
  updateThreshold,
  getUser
}
