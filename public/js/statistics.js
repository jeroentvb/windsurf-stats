// import { chart } from './modules/chart.js'
import { BarChart } from './modules/chart.js'
import { data } from './modules/data.js'
import { element } from './modules/element.js'
import { select } from './modules/selectYear.js'

(async () => {
  try {
    const json = await data.get.sessions()
    const sessions = data.sortByDate(json)
    const gear = await data.get.gear()
    const sessionAmount = document.getElementById('session-amount')

    const chart = new BarChart(sessions, gear)

    chart.init()

    console.log(chart.chart.data.datasets)

    sessionAmount.textContent = chart.sessionAmount

    select.year.addOptions(chart.years, e => {
      const year = e.target.value

      chart.update(year)

      sessionAmount.textContent = chart.sessionAmount
    })
  } catch (err) {
    console.error(err)

    const main = document.getElementsByTagName('main')[0]
    const p = element.paragraph('Something went wrong..')

    element.update(main, p)
  }
})()
