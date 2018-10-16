// Splice windfinder data to the first day instead of the three days from the superforecast
function spliceToFirstDay(array) {
  // Remove the first 7 hours
  array.splice(0, 9)
  // Remove other days
  array.splice(12, 60)
}

// Get the date in dd-mm-yyyy format
function getToday() {
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

function objToStr(obj) {
  return JSON.stringify(obj, null, 4)
}

function exportObj(obj, name) {
  var fs = require('fs')
  fs.writeFile(name + 'offline-data.json', JSON.stringify(obj, null, 4), function(err) {
    if (err) {
      throw err
    } else {
      console.log(`${name}-offline.data.json written`)
    }
  })
  return
}

// Only get daylight hours of 3 days
function spliceToDayHours(array) {
  // Remove the first 7 hours
  array.splice(0, 7)
  // Remove the night between day 1 and 2
  array.splice(16, 8)
  // Remove the night between day 2 and 3
  array.splice(32, 8)
  // Remove last hour of day 3 (23h)
  array.splice(48, 10)
}

module.exports = {
  spliceToFirstDay,
  getToday,
  objToStr,
  exportObj
}
