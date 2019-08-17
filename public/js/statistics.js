

import { data } from './modules/data.js'
// import { element } from './modules/element.js'
import { select } from './modules/selectYear.js'
import { chart } from './modules/chart.js'

(async () => {
  try {
    const json = await data.get.sessions()
    const sessions = data.sortByDate(json)
    const gear = await data.get.gear()
    const years = data.get.years(sessions)

    select.year.addOptions(years)

    const filteredSessions = data.filter.year(sessions, years[years.length - 1])

    const labels = data.parse.months(filteredSessions)
    const dataset = data.parse.sessions(filteredSessions, gear)

    document.getElementById('session-amount').textContent = sessions.length

    const graph = chart.render(dataset, labels)

    console.log(graph)
  } catch (err) {
    console.error(err)
  }
})()

    // const dataset = [{
    //   label: 'Amount of sessions in a month',
    //   data: parsedData.map(item => item.count),
    //   // backgroundColor: [
    //   //   'rgba(255, 99, 132, 0.2)',
    //   //   'rgba(54, 162, 235, 0.2)',
    //   //   'rgba(255, 206, 86, 0.2)',
    //   //   'rgba(75, 192, 192, 0.2)',
    //   //   'rgba(153, 102, 255, 0.2)',
    //   //   'rgba(255, 159, 64, 0.2)'
    //   // ],
    //   // borderColor: [
    //   //   'rgba(255, 99, 132, 1)',
    //   //   'rgba(54, 162, 235, 1)',
    //   //   'rgba(255, 206, 86, 1)',
    //   //   'rgba(75, 192, 192, 1)',
    //   //   'rgba(153, 102, 255, 1)',
    //   //   'rgba(255, 159, 64, 1)'
    //   // ],
    //   borderWidth: 1
    // },
    // {
    //   label: 'Amount of sessions in a month',
    //   data: parsedData.map(item => item.count),
    //   backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //   // backgroundColor: [
    //   //   'rgba(255, 99, 132, 0.2)',
    //   //   'rgba(54, 162, 235, 0.2)',
    //   //   'rgba(255, 206, 86, 0.2)',
    //   //   'rgba(75, 192, 192, 0.2)',
    //   //   'rgba(153, 102, 255, 0.2)',
    //   //   'rgba(255, 159, 64, 0.2)'
    //   // ],
    //   // borderColor: [
    //   //   'rgba(255, 99, 132, 1)',
    //   //   'rgba(54, 162, 235, 1)',
    //   //   'rgba(255, 206, 86, 1)',
    //   //   'rgba(75, 192, 192, 1)',
    //   //   'rgba(153, 102, 255, 1)',
    //   //   'rgba(255, 159, 64, 1)'
    //   // ],
    //   borderWidth: 1
    // }]