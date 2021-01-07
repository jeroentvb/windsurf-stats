import { Router } from 'express'
import userRoutes from './user/user.routes'
import userDataRoutes from './user-data/user-data.routes'
import sessionDataRoutes from './session-data/session-data.routes'
import spotRoutes from './conditions/conditions.routes'

export default Router()
  .use(userRoutes)
  .use(userDataRoutes)
  .use(sessionDataRoutes)
  .use(spotRoutes)
