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

function parse (sessions: Session[], user: User): ChartData {
  const sails: string[] = user.gear!.sails.map(sail => `${sail.brand} ${sail.model} ${sail.size}`)
  const datasets: ChartData['datasets'] = []
  const sessionPerMonth: Session[][] = []

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
      const color: string = colors[sails.indexOf(session.gear.sail)] ? colors[sails.indexOf(session.gear.sail)] : ''
      if (!datasets[j]) {
        datasets[j] = {
          data: [],
          backgroundColor: [],
          sessions: []
        }
      }

      datasets[j].data[i] = 1
      datasets[j].backgroundColor[i] = color
      datasets[j].sessions[i] = session
    })
  })

  return {
    year: new Date(sessions[0].date).getFullYear(),
    labels: months,
    datasets
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

export default {
  parse
}
