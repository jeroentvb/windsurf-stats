import helper from '../services/helper'

import { Session } from '../../../shared/interfaces/Session'
import { User } from '../../../shared/interfaces/User'
import { ChartData } from '../interfaces'
import { ALL } from '@/constants'

export default class DataParser {
  private readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  private readonly ratings: string[] = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ]
  private readonly colors = [
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

  protected readonly user: User
  protected readonly sessions: Session[]
  protected readonly allSessions: Session[]

  constructor (sessions: Session[], user: User) {
    this.user = user
    this.allSessions = sessions
    this.sessions = sessions.filter(session => session.rating >= <number>user.threshold)

    for (let i = 0; i < 30; i++) {
      this.colors.push('#' + ((1 << 24) * Math.random() | 0).toString(16))
    }
  }

  /**
   * Parse the session data to a chartjs usable format
   * @param sessions
   * @param user
   */
  protected parseSessions (sessions: Session[]): ChartData {
    const sails: string[] = this.user.gear!.sails.map(sail => `${sail.brand} ${sail.model} ${sail.size}`)
    const datasets: ChartData['datasets'] = []
    const sessionPerMonth: Session[][] = []
    const legend: ChartData['legend'] = sails.map(sail => {
      return {
        item: sail,
        color: this.colors[sails.indexOf(sail)] ? this.colors[sails.indexOf(sail)] : '#808080'
      }
    })

    /**
     * Fill the sessionPerMonth with 12 arrays
     */
    this.months.forEach((month, i) => {
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
    this.months.forEach((month: string, i: number) => {
      sessionPerMonth[i].forEach((session, j) => {
        const color: string = this.colors[sails.indexOf(session.gear.sail)] ? this.colors[sails.indexOf(session.gear.sail)] : '#808080'
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
      labels: this.months,
      datasets,
      legend
    }
  }

  protected parseSessionsYear (): ChartData {
    const datasets: ChartData['datasets'] = []
    const sessionPerMonth: Session[][] = []

    const monthsInBetween: number = helper.monthDiff(<string> this.sessions[0].date, <string> this.sessions[this.sessions.length - 1].date)

    /**
     * Fill the sessionPerMonth with the amount of months arrays
     */
    for (let i = 0; i < monthsInBetween; i++) {
      sessionPerMonth[i] = []
    }

    /**
     * Put the session in the array corresponding to the month it was recorded in
     */
    let currentYear: number = new Date(this.sessions[0].date).getFullYear()
    let currentIndex: number = 0

    this.sessions.forEach(session => {
      const month = new Date(session.date).getMonth() - new Date(this.sessions[0].date).getMonth()
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
    const sails: string[] = this.user.gear!.sails.map(sail => `${sail.brand} ${sail.model} ${sail.size}`)

    for (let i = 0; i < monthsInBetween; i++) {
      sessionPerMonth[i].forEach((session, j) => {
        const color: string = this.colors[sails.indexOf(session.gear.sail)] ? this.colors[sails.indexOf(session.gear.sail)] : '#808080'
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
    const dateRange: string[] = helper.dateRange(<string> this.sessions[0].date, <string> this.sessions[this.sessions.length - 1].date)

    dateRange.forEach(date => {
      const monthIndex = new Date(date).getMonth()

      labels.push(this.months[monthIndex])
    })

    /**
     * Create legend object
     */
    const legend: ChartData['legend'] = sails.map(sail => {
      return {
        item: sail,
        color: this.colors[sails.indexOf(sail)] ? this.colors[sails.indexOf(sail)] : '#808080'
      }
    })

    return {
      year: 0,
      amount: this.sessions.length,
      labels,
      datasets,
      legend
    }
  }

  /**
   * Parse the amount of times a sail or board has been used or how many times a spot has been visited
   * @param type
   * @param sessions
   */
  protected parseAmount (type: 'sail' | 'board' | 'spot', sessions = this.sessions): ChartData {
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
    const backgroundColors: string[] = dataset.map((x, i) => this.colors[i])

    return {
      year: new Date(sessions[0].date).getFullYear(),
      amount: sessions.length,
      labels: gear,
      datasets: [
        {
          data: dataset.map(gear => gear.count),
          backgroundColor: this.colors
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

  protected parseRating (all = true, sessions = this.allSessions): ChartData {
    const sails: string[] = this.user.gear!.sails.map(sail => `${sail.brand} ${sail.model} ${sail.size}`)
    const datasets: ChartData['datasets'] = []
    const sessionPerRating: Session[][] = []
    const legend: ChartData['legend'] = sails.map(sail => {
      return {
        item: sail,
        color: this.colors[sails.indexOf(sail)] ? this.colors[sails.indexOf(sail)] : '#808080'
      }
    })

    /**
     * Fill the sessionPerMonth with 12 arrays
     */
    for (let i = 0; i < 10; i++) {
      sessionPerRating[i] = []
    }

    /**
     * Put the session in the array corresponding to the rating it has
     */
    sessions.forEach(session => {
      sessionPerRating[session.rating - 1].push(session)
    })

    /**
     * Put the sessions in the correct object and array
     */
    sessionPerRating.forEach((_sessionArray: Session[], i: number) => {
      sessionPerRating[i].forEach((session, j) => {
        const color: string = this.colors[sails.indexOf(session.gear.sail)] ? this.colors[sails.indexOf(session.gear.sail)] : '#808080'
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
      year: all ? 0 : new Date(sessions[0].date).getFullYear(),
      amount: sessions.length,
      labels: this.ratings,
      datasets,
      legend
    }
  }
}
