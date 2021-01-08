import { Router } from 'express'
import controller from './user-data.controller'

export default Router()
  .post('/gear', controller.updateGear)
  .post('/spots', controller.updateSpots)
  .post('/threshold', controller.updateThreshold)
