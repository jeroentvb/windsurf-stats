import { Router } from 'express'
import controller from './user.controller'

export default Router()
  .post('/register', controller.register)
  .post('/login', controller.login)
  .post('/logout', controller.logout)
