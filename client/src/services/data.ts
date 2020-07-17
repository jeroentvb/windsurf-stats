import helper from '@/services/helper'

import { Session } from '../../../shared/interfaces/Session'
import { User } from '../../../shared/interfaces/User'
import { ChartData } from '@/interfaces'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const colors = [
  '#ff3e30', // red
  '#ff930f', // orange
  '#ffe626', // yellow
  '#45ff24', // green
  '#009888', // teal
  '#00BCD9', // cyan
  '#3d61ff', // blue
  '#4B0082', // deep purple
  '#9400D3', // purple
  '#7C5547' // brown
]

for (let i = 0; i < 30; i++) {
  colors.push('#' + ((1 << 24) * Math.random() | 0).toString(16))
}

export default class Data {
  sessions: Session[]
  years: string[]
  user: User

  constructor (sessions: Session[], years: string[], user: User) {
    this.sessions = sessions.filter(session => session.rating >= <number>user.threshold)
    this.years = years
    this.user = user
  }

  /**
   * Get session data for all years in chartjs usable format
   */
  parseSessions (): ChartData[] {
    const yearDatasets: ChartData[] = []

    this.years.forEach(year => {
      if (year === 'All') {
        yearDatasets.push(parseSessionsYear(this.sessions, this.user))
        return
      }

      const filteredSessions = this.sessions.filter((session: Session) => {
        return (session.date as string).split('-')[0] === year
      })

      yearDatasets.push(parseSessions(filteredSessions, this.user))
    })

    return yearDatasets.reverse()
  }

  /**
   * Get sail, board or spot data for all years in chartjs usable format
   * @param type
   */
  parseAmount (type: 'sail' | 'board' | 'spot'): ChartData[] {
    const yearDatasets: ChartData[] = []

    this.years.forEach(year => {
      if (year === 'All') {
        const dataset = parseAmount(this.sessions, type)
        dataset.year = 0
        return yearDatasets.push(dataset)
      }

      const filteredSessions = this.sessions.filter((session: Session) => {
        return (session.date as string).split('-')[0] === year
      })

      yearDatasets.push(parseAmount(filteredSessions, type))
    })

    return yearDatasets.reverse()
  }
}

/**
 * Parse the session data to a chartjs usable format
 * @param sessions
 * @param user
 */
function parseSessions (sessions: Session[], user: User): ChartData {
  const sails: string[] = user.gear!.sails.map(sail => `${sail.brand} ${sail.model} ${sail.size}`)
  const datasets: ChartData['datasets'] = []
  const sessionPerMonth: Session[][] = []
  const legend: ChartData['legend'] = sails.map(sail => {
    return {
      item: sail,
      color: colors[sails.indexOf(sail)] ? colors[sails.indexOf(sail)] : '#808080'
    }
  })

  /**
   * Fill the sessionPerMonth with 12 arrays
   */
  months.forEach((month, i) => {
    sessionPerMonth[i] = []
  })

  /**
   * Put the session in the array corresponding to the month it was recorded in
   */
  sessions.forEach(session => {
    const month = new Date(session.date).getMonth()
    sessionPerMonth[month].push(session)
  })

  /**
   * Put the sessions in the correct object and array
   */
  months.forEach((month: string, i: number) => {
    sessionPerMonth[i].forEach((session, j) => {
      const color: string = colors[sails.indexOf(session.gear.sail)] ? colors[sails.indexOf(session.gear.sail)] : '#808080'
      if (!datasets[j]) {
        datasets[j] = {
          data: [],
          backgroundColor: [],
          sessions: []
        }
      }

      datasets[j].data[i] = 1
      datasets[j].backgroundColor[i] = color
      datasets[j].sessions![i] = session
    })
  })

  return {
    year: new Date(sessions[0].date).getFullYear(),
    amount: sessions.length,
    labels: months,
    datasets,
    legend
  }
}

function parseSessionsYear (sessions: Session[], user: User): ChartData {
  const datasets: ChartData['datasets'] = []
  const sessionPerMonth: Session[][] = []

  const monthsInBetween: number = helper.monthDiff(<string>sessions[0].date, <string>sessions[sessions.length - 1].date)

  /**
   * Fill the sessionPerMonth with the amount of months arrays
   */
  for (let i = 0; i < monthsInBetween; i++) {
    sessionPerMonth[i] = []
  }

  /**
   * Put the session in the array corresponding to the month it was recorded in
   */
  let currentYear: number = new Date(sessions[0].date).getFullYear()
  let currentIndex: number = 0

  sessions.forEach(session => {
    const month = new Date(session.date).getMonth() - new Date(sessions[0].date).getMonth()
    const year = new Date(session.date).getFullYear()

    if (year !== currentYear) {
      currentYear++
      currentIndex += 12
    }

    sessionPerMonth[month + currentIndex].push(session)
  })

  /**
   * Put the sessions in the correct object and array
   */
  const sails: string[] = user.gear!.sails.map(sail => `${sail.brand} ${sail.model} ${sail.size}`)

  for (let i = 0; i < monthsInBetween; i++) {
    sessionPerMonth[i].forEach((session, j) => {
      const color: string = colors[sails.indexOf(session.gear.sail)] ? colors[sails.indexOf(session.gear.sail)] : '#808080'
      if (!datasets[j]) {
        datasets[j] = {
          data: [],
          backgroundColor: [],
          sessions: []
        }
      }

      datasets[j].data[i] = 1
      datasets[j].backgroundColor[i] = color
      datasets[j].sessions![i] = session
    })
  }

  /**
   * Create an array of labels
   */
  const labels: string[] = []
  const dateRange: string[] = helper.dateRange(<string>sessions[0].date, <string>sessions[sessions.length - 1].date)

  dateRange.forEach(date => {
    const monthIndex = new Date(date).getMonth()

    labels.push(months[monthIndex])
  })

  /**
   * Create legend object
   */
  const legend: ChartData['legend'] = sails.map(sail => {
    return {
      item: sail,
      color: colors[sails.indexOf(sail)] ? colors[sails.indexOf(sail)] : '#808080'
    }
  })

  return {
    year: 0,
    amount: sessions.length,
    labels,
    datasets,
    legend
  }
}

/**
 * Parse the amount of times a sail or board has been used or how many times a spot has been visited
 * @param sessions
 * @param type
 */
function parseAmount (sessions: Session[], type: 'sail' | 'board' | 'spot'): ChartData {
  const dataset: { name: string, count: number}[] = []

  sessions.forEach((session, i) => {
    const name = type === 'spot' ? session.spot : session.gear[type]
    let exists = false

    if (i === 0) {
      dataset.push({
        name,
        count: 1
      })
      return
    }

    dataset.forEach(item => {
      /**
       * Check if the gear item is already added to the dataaset
       */
      if (item.name === name) {
        item.count++
        exists = true
      }
    })

    /**
     * If not, push a new object with the new gear item
     */
    if (exists === false) {
      dataset.push({
        name,
        count: 1
      })
    }
  })

  /**
   * Sort the gear in the right order
   */
  if (type === 'sail') {
    dataset.sort((a, b) => {
      return helper.getSailSize(a.name) - helper.getSailSize(b.name)
    })
  } else {
    dataset.sort((a, b) => {
      return b.count - a.count
    })
  }

  const gear: string[] = dataset.map(gear => gear.name)
  const backgroundColors: string[] = dataset.map((x, i) => colors[i])

  return {
    year: new Date(sessions[0].date).getFullYear(),
    amount: sessions.length,
    labels: gear,
    datasets: [
      {
        data: dataset.map(gear => gear.count),
        backgroundColor: colors
      }
    ],
    legend: gear.map((item, i) => {
      return {
        item,
        color: backgroundColors[i]
      }
    })
  }
}

// {
//   labels: ['Maand..., 'Maand 2'],
//   datasets: [
//     {
//       label: 'Low',
//       data: [67.8, 2],
//       backgroundColor: '#D6E9C6' // green
//     },
//     {
//       label: 'Moderate',
//       data: [20.7],
//       backgroundColor: '#FAEBCC' // yellow
//     },
//     {
//       label: 'High',
//       data: [11.4],
//       backgroundColor: '#EBCCD1' // red
//     }
//   ]
// }
