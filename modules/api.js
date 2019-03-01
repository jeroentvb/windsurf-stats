const db = require('./db')
const uuidv4 = require('uuid/v4')
const config = require('../app-config.json')

async function get (req, res) {
  if (!config.enableApi) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const query = req._parsedUrl.query ? req._parsedUrl.query : ''
  const key = query.substring(4)

  if (!query.includes('key=') || !key) {
    res.status(401).json({ error: 'No api key specified' })
    return
  }

  try {
    const userData = await db.query('SELECT id FROM windsurfStatistics.users WHERE apiKey = ?', key)

    if (userData.length < 1) {
      res.status(401).json({ error: 'Invalid key' })
      return
    }

    const userId = userData[0].id
    const sessions = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', userId)

    sessions.forEach(session => {
      delete session.statisticId
      delete session.userId
    })

    res.json(sessions)
  } catch (err) {
    console.error(err)

    res.json({ error: 'An error occurred..' })
  }
}

async function key (req, res) {
  if (!config.enableApi) {
    res.redirect('/')
    return
  }
  const user = req.session.user
  const uuid = uuidv4()

  try {
    await db.query('UPDATE windsurfStatistics.users SET apiKey = ? WHERE id = ?', [
      uuid,
      user.id
    ])
    res.json(uuid)
  } catch (err) {
    console.error(err)

    res.json({ error: 'An error occurred..' })
  }
}

module.exports = {
  get,
  key
}
