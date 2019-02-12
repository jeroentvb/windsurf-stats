const db = require('./db')
const uuidv4 = require('uuid/v4')

function get (req, res) {
  res.send('ok')
}

function key (req, res) {
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
