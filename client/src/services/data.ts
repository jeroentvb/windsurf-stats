import DataParser from './data-parser'

import { Session } from '../../../shared/interfaces/Session'
import { User } from '../../../shared/interfaces/User'
import { ChartData } from '@/interfaces'

import { ALL } from '../constants'

export default class Data extends DataParser {
  readonly years: string[]

  constructor (sessions: Session[], years: string[], user: User) {
    super(sessions, user)

    this.years = years
  }

  /**
   * Get session data for all years in chartjs usable format
   */
  public getSessionAmountDataset (): ChartData[] {
    const yearDatasets: ChartData[] = []

    this.years.forEach(year => {
      if (year === ALL) {
        yearDatasets.push(this.parseSessionsYear())
        return
      }

      const filteredSessions = this.sessions.filter((session: Session) => {
        return (session.date as string).split('-')[0] === year
      })

      yearDatasets.push(this.parseSessions(filteredSessions))
    })

    return yearDatasets.reverse()
  }

  /**
   * Get sail, board or spot data for all years in chartjs usable format
   * @param type
   */
  public getAmountDataset (type: 'sail' | 'board' | 'spot'): ChartData[] {
    const yearDatasets: ChartData[] = []

    this.years.forEach(year => {
      if (year === ALL) {
        const dataset = this.parseAmount(type)
        dataset.year = 0
        return yearDatasets.push(dataset)
      }

      const filteredSessions = this.sessions.filter((session: Session) => {
        return (session.date as string).split('-')[0] === year
      })

      yearDatasets.push(this.parseAmount(type, filteredSessions))
    })

    return yearDatasets.reverse()
  }

  public getRatingDataset (): ChartData[] {
    const yearDatasets: ChartData[] = []

    this.years.forEach(year => {
      if (year === ALL) {
        yearDatasets.push(this.parseRating())
        return
      }

      const filteredSessions = this.allSessions.filter((session: Session) => {
        return (session.date as string).split('-')[0] === year
      })

      yearDatasets.push(this.parseRating(false, filteredSessions))
    })

    return yearDatasets.reverse()
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
