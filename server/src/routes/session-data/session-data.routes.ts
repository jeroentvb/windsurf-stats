import { Router } from 'express'
import controller from './session-data.controller'

export default Router()
  .post('/session', controller.session)
  .patch('/session', controller.updateSession)
