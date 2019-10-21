const db = require('./db')
const render = require('./render')
const Json2csvParser = require('json2csv').Parser
const helper = require('jeroentvb-helper')

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

async function downloadSessions (req, res) {
  const type = req.query.type

  if (!type) {
    res.render('error', {
      page: 'Error',
      msg: 'Invalid url'
    })

    return
  }

  try {
    const sessions = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)

    sessions.forEach(session => {
      delete session.statisticId
      delete session.userId
    })

    if (type === 'csv') {
      const fields = [
        'date',
        'spot',
        'windspeed',
        'windgust',
        'wind direction',
        'sail',
        'board',
        'rating',
        'note'
      ]

      const json2csvParser = new Json2csvParser({ fields, delimiter: ';' })
      const csv = json2csvParser.parse(sessions)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${req.session.user.name}-windsurf-stats-${Date.now()}.csv`)
      res.send(csv)
    } else if (type === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${req.session.user.name}-windsurf-stats-${Date.now()}.json`)
      res.send(helper.stringify(sessions))
    }
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

module.exports = {
  send: {
    sessions,
    gear
  },
  download: {
    sessions: downloadSessions
  }
}
