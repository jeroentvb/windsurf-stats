import { User } from '../../../../shared/interfaces/User'
import db from '../../services/db'
import auth from '../../services/auth'

async function addUser (user: User) {
  try {
    const userData = await db.get({$or: [
      { name: user.name },
      { email: user.email }
    ]})

    if (userData.length > 0) throw 409

    const hash = await auth.createHash(user.password!)

    await db.insert({
      name: user.name,
      email: user.email,
      password: hash,
      gear: {
        boards: [],
        sails: []
      },
      spots: [],
      sessions: [],
      threshold: 5
    })
  } catch (err) {
    throw err
  }
}

export default {
  addUser
}
