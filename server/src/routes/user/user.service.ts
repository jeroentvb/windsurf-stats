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

async function setEmail (username: string, email: string, password: string) {
  try {
    const validEmail = new RegExp(/\S+@\S+\.\S+/).test(email)

    if (!validEmail) throw 409

    if (! await auth.userIsAuthenticated(username, password)) throw 401

    const users = await db.get({ email })

    if (users.length > 0) throw 409

    await db.update({name: username }, { $set: {
      email
    }})
  } catch (err) {
    throw err
  }
}

export default {
  addUser,
  setEmail
}
