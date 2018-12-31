// Splice windfinder data to the first day instead of the three days from the superforecast
function spliceToFirstDay (array) {
  // Remove the first 7 hours
  // array.splice(0, 9)
  // Remove other days
  array.splice(12, 60)
}

// Get the date in dd-mm-yyyy format
function getToday () {
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth() + 1
  var yyyy = today.getFullYear()

  if (dd < 10) {
    dd = `0${dd}`
  }
  if (mm < 10) {
    mm = `0${mm}`
  }

  return `${dd}-${mm}-${yyyy}`
}

function getYesterday () {
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth() + 1
  var yyyy = today.getFullYear()

  if (dd < 10) {
    dd = `0${dd}`
  }
  if (mm < 10) {
    mm = `0${mm}`
  }

  if (dd - 1 === 0) {
    return `${30}-${mm - 1}-${yyyy}`
  } else {
    return `${dd - 1}-${mm}-${yyyy}`
  }
}

function objToStr (obj) {
  return JSON.stringify(obj, null, 4)
}

function exportObj (name, obj) {
  var fs = require('fs')
  fs.writeFile(name + '-export.json', objToStr(obj), err => {
    if (err) throw err
    console.log(`${name}-export.json written`)
  })
}

function cleanObj (obj) {
  for (let key in obj) {
    if (obj[key] === '' || obj[key] === null) {
      console.log(obj[key])
      console.log(typeof obj[key])
      delete obj[key]
    }
  }
}

// Only get daylight hours of 3 days
function spliceToDayHours (array) {
  // Remove the first 7 hours
  array.splice(0, 7)
  // Remove the night between day 1 and 2
  array.splice(16, 8)
  // Remove the night between day 2 and 3
  array.splice(32, 8)
  // Remove last hour of day 3 (23h)
  array.splice(48, 10)
}

function localize (lang) {
  const localization = require(`../localization/${lang}.json`)
  return localization
}

function getWindDirection (deg, windDirections) {
  let val = Math.floor((deg / 22.5) + 0.5)
  return windDirections[(val % 16)]
}

module.exports = {
  spliceToFirstDay,
  getToday,
  getYesterday,
  objToStr,
  exportObj,
  cleanObj,
  localize,
  getWindDirection
}
