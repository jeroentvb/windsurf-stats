import { Session } from '../../../shared/interfaces/Session'

interface Data {
  labels: string[]
  datasets: {
    data: any[]
  }[]
}

function parse (sessions: Session[]): Data {
  const datasets: Data['datasets'] = [ { data: [] } ]
  const sessionPerMonth: Session[][] = []

  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
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
