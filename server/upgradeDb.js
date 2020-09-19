const db = require('./dist/modules/db')
const { ObjectId } = require('mongodb')
require('dotenv').config()

async function start () {
  const users = await db.get()

  await Promise.all(users.map(async (user) => {
    const sessions = user.sessions.map(session => Object.assign(session, { _id: new ObjectId() }))
    await db.update({ _id: user._id }, { $set: { sessions } })
  }))

  process.exit()
}

(async function () {
  await db.init(process.env.DB_NAME)

  start()
})()
