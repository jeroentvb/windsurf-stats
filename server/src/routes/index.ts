import { Router } from 'express'
import userRoutes from './auth/user.routes'

export default Router()
  .use(userRoutes)
