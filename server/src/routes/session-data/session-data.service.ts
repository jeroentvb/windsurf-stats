import db from '../../services/db'

import { Session } from '../../../../shared/interfaces/Session'

function validateSessionData (session: Session): boolean {
  let valid: boolean = true

  for (const [_key, value] of Object.entries(session)) {
    if (!value) valid = false
  }
  for (const [_key, value] of Object.entries(session.time)) {
    if (!value) valid = false
  }
  for (const [_key, value] of Object.entries(session.gear)) {
    if (!value) valid = false
  }
  for (const [_key, value] of Object.entries(session.conditions)) {
    if (!value && value !== 0) valid = false
  }
  
  return valid
}

function addSession (username: string, session: Session) {
  return db.update({ name: username }, { $push: { sessions: session } })
}

function updateSession (username: string, session: Session) {
  return db.update({
    name: username,
    'sessions._id': session._id
  },
  {
    $set: {
      'sessions.$': session
    }
  })
}

export default {
  validateSessionData,
  addSession,
  updateSession
}
