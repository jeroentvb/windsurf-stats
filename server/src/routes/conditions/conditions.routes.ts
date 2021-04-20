import { Router } from 'express'
import controller from './conditions.controller'

export default Router()
  .get('/conditions', controller.get)
