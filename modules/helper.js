const bcrypt = require('bcrypt')
const config = require('../app-config.json')

function hashPassword (password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, config.saltRounds, (err, hash) => {
      if (err) reject(err)
      resolve(hash)
    })
  })
}

function getToday () {
  const today = new Date()
  let dd = today.getDate()
  let mm = today.getMonth() + 1
  let yyyy = today.getFullYear()

  if (dd < 10) dd = `0${dd}`
  if (mm < 10) mm = `0${mm}`

  return `${dd}-${mm}-${yyyy}`
}

function getYesterday () {
  const today = new Date()
  let dd = today.getDate()
  let mm = today.getMonth() + 1
  let yyyy = today.getFullYear()

  if (dd < 10) dd = `0${dd}`
  if (mm < 10) mm = `0${mm}`

  if (dd - 1 === 0) {
    return `${30}-${mm - 1}-${yyyy}`
  } else {
    return `${dd - 1}-${mm}-${yyyy}`
  }
}

module.exports = {
  hashPassword,
  getToday,
  getYesterday
}
