import { Conditions, Session } from '../../../shared/interfaces/Session'

// function formatSpotName (id: string): string {
//   return id.split('-').join(' ')
//     .split('_').join(' ')
//     .split(' ')
//     .map(s => s.charAt(0).toUpperCase() + s.substring(1))
//     .join(' ')
// }

function getNumberArray (start: number, end: number, step: number): number[] {
  const numbers: number[] = []
  for (let i = start; i < (end + step); i += step) {
    numbers.push(i)
  }
  return numbers
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

function createCsv (sessions: Session[], delimiter: string) {
  const data = sessions.map(session => {
    return {
      date: new Date(session.date).toLocaleDateString(),
      start: session.time.start,
      end: session.time.end,
      spot: session.spot,
      sail: session.gear.sail,
      board: session.gear.board,
      windspeed: session.conditions.windspeed,
      windgust: session.conditions.windgust,
      winddirection: session.conditions.winddirection,
      temperature: session.conditions.temperature,
      rating: session.rating,
      note: session.note
    }
  })
  const replacer = (key: string, value: any) => value === null ? '' : value
  const header = Object.keys(data[0])
  let csv = data.map((row: any) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(delimiter))
  csv.unshift(header.join(delimiter))

  return csv.join('\r\n')
}

/**
 * Get the highest resolution model name
 * @param models
 */
function getHighestResolutionModel (models: string[]): string {
  return models.reduce((prev, next) => {
    const a = parseFloat(prev.replace(/^\D+/g, ''))
    const b = parseFloat(next.replace(/^\D+/g, ''))

    return a > b ? next : prev
  })
}

/**
 * Calculate average conditions based on an array of conditions
 * @param conditions
 */
function calcAverageConditions (conditions: Conditions[]): Conditions {
  return conditions.reduce((prev, condition, i) => {
    const c = {
      windspeed: prev.windspeed + condition.windspeed,
      windgust: prev.windgust + condition.windgust,
      winddirection: prev.winddirection + condition.winddirection,
      temperature: prev.temperature + condition.temperature
    }

    if (i === conditions.length - 1) {
      return {
        windspeed: Math.round(c.windspeed / conditions.length),
        windgust: Math.round(c.windgust / conditions.length),
        winddirection: Math.round(c.winddirection / conditions.length),
        temperature: Math.round(c.temperature / conditions.length)
      }
    }

    return c
  })
}

export default {
  // formatSpotName,
  getNumberArray,
  getSailSize,
  monthDiff,
  dateRange,
  createCsv,
  getHighestResolutionModel,
  calcAverageConditions
}
