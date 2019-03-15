function getToday () {
  const today = new Date()
  let dd = today.getDate()
  let mm = today.getMonth() + 1
  let yyyy = today.getFullYear()

  if (dd < 10) dd = `0${dd}`
  if (mm < 10) mm = `0${mm}`

  return `${dd}-${mm}-${yyyy}`
}

function localize (lang) {
  const localization = require(`../localization/${lang}.json`)
  return localization
}

function getWindDirection (deg, windDirections) {
  const val = Math.floor((deg / 22.5) + 0.5)
  return windDirections[(val % 16)]
}

module.exports = {
  getToday,
  localize,
  getWindDirection
}
