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
  getYesterday
}
