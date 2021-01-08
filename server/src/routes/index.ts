import { Router } from 'express'

import userRoutes from './user/user.routes'
import userDataRoutes from './user-data/user-data.routes'
import sessionDataRoutes from './session-data/session-data.routes'
import spotRoutes from './conditions/conditions.routes'

/**
 * @deprecated
 */
import oldSessions from './old-sessions'

export default Router()
  .use(userRoutes)
  .use(userDataRoutes)
  .use(sessionDataRoutes)
  .use(spotRoutes)
  .post('/old-sessions', oldSessions.submit)
