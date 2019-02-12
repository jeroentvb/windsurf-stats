const db = require('./db')
const uuidv4 = require('uuid/v4')
const config = require('../app-config.json')

function get (req, res) {
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

  db.query('SELECT id FROM windsurfStatistics.users WHERE apiKey = ?', key)
    .then(result => {
      if (result.length < 1) {
        res.status(401).json({ error: 'Invalid key' })
        return
      }

      const id = result[0].id

      db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', id)
        .then(result => {
          result.forEach(session => {
            delete session.statisticId
            delete session.userID
          })
          return result
        })
        .then(data => res.json(data))
        .catch(err => console.error(err))
    })
    .catch(err => console.error(err))
}

function key (req, res) {
  if (!config.enableApi) {
    res.redirect('/')
    return
  }
  const user = req.session.user
  const uuid = uuidv4()

  db.query('UPDATE windsurfStatistics.users SET apiKey = ? WHERE id = ?', [
    uuid,
    user.id
  ])
    .then(result => res.json(uuid))
    .catch(err => console.error(err))
}

module.exports = {
  get,
  key
}
