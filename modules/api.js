const db = require('./db')
const render = require('./render')

async function sessions (req, res) {
  const username = req.query.user

  if (username) {
    try {
      const user = await db.query('SELECT id FROM windsurfStatistics.users WHERE username = ?', username)

      if (user.length === 0) {
        res.json({
          error: `${username} not found`
        })

        return
      }

      let sessions = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', user[0].id)

      sessions.forEach(session => {
        delete session.statisticId
        delete session.userId
      })

      res.json(sessions)
    } catch (err) {
      console.error(err)
      res.status(500).json({
        error: `Something went wrong.`
      })
    }
  } else {
    try {
      let sessions = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)

      sessions.forEach(session => {
        delete session.statisticId
        delete session.userId
      })

      res.json(sessions)
    } catch (err) {
      console.error(err)
      res.status(500).json({
        error: `Something went wrong.`
      })
    }
  }
}

async function gear (req, res) {
  const userId = req.session.user.id

  try {
    const data = await db.query('SELECT * FROM windsurfStatistics.gear WHERE userId = ?', userId)
    let gear = {
      boards: [],
      sails: [],
      spots: []
    }

    for (let key in data[0]) {
      if (key.includes('board') && data[0][key] !== '') gear.boards.push(data[0][key])
      if (key.includes('sail') && data[0][key] !== '') gear.sails.push(data[0][key])
      if (key.includes('spot') && data[0][key] !== '') gear.spots.push(data[0][key])
    }

    res.json(gear)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: `Something went wrong.`
    })
  }
}

module.exports = {
  send: {
    sessions,
    gear
  }
}
