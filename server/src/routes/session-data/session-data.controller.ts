import { Request, Response } from 'express'
import db from '../../services/db'

import { Session } from '../../../../shared/interfaces/Session'
import { User } from '../../../../shared/interfaces/User'
import sessionDataService from './session-data.service'

async function session (req: Request, res: Response) {
  const { name } = req.session!.user
  const session: Session = Object.assign(req.body, { _id: db.parseId() })

  if (!sessionDataService.validateSessionData(session)) {
    res.status(422).send('Missing fields')
    return
  }

  try {
    await sessionDataService.addSession(name, session)

    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

async function updateSession (req: Request, res: Response) {
  const { name }: User = req.session?.user
  const session: Session = req.body

  if (!sessionDataService.validateSessionData(session)) {
    res.status(422).send('Missing fields')
    return
  }

  try {
    await sessionDataService.updateSession(name, session)

    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
}

export default {
  session,
  updateSession
}
