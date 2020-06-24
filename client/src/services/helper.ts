function formatSpotName (id: string): string {
  return id.split('-').join(' ')
    .split('_').join(' ')
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

function getSailSize (sail: string): number {
  const splitSail = sail.split(' ')

  return parseFloat(splitSail[splitSail.length - 1])
}

/**
 * Get the amount of months between 2 months
 * @param dateFrom
 * @param dateTo
 */
function monthDiff (dateFrom: string, dateTo: string): number {
  const from = new Date(dateFrom)
  const to = new Date(dateTo)

  return to.getMonth() - from.getMonth() +
    (12 * (to.getFullYear() - from.getFullYear())) + 1
}

/**
 * Get the range of dates between 2 dates
 * @param startDate
 * @param endDate
 */
function dateRange (startDate: string, endDate: string): string[] {
  const start = startDate.split('-')
  const end = endDate.split('-')
  const startYear = parseInt(start[0])
  const endYear = parseInt(end[0])
  const dates = []

  for (let i = startYear; i <= endYear; i++) {
    const endMonth = i !== endYear ? 11 : parseInt(end[1]) - 1
    const startMon = i === startYear ? parseInt(start[1]) - 1 : 0

    for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
      const month = j + 1
      const displayMonth = month < 10 ? '0' + month : month

      dates.push([i, displayMonth, '01'].join('-'))
    }
  }
  return dates
}

export default {
  formatSpotName,
  getSailSize,
  monthDiff,
  dateRange
}
