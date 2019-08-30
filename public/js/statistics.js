// import { chart } from './modules/chart.js'
import { BarChart, DoughnutChart } from './modules/chart.js'
import { data } from './modules/data.js'
import { element } from './modules/element.js'
import { select } from './modules/selectYear.js'

const selectChart = document.getElementById('select-chart')
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
];

(async () => {
  try {
    const json = await data.get.sessions()
    const sessions = data.sortByDate(json)
    const gear = await data.get.gear()
    const sessionAmount = document.getElementById('session-amount')

    const years = data.get.years(sessions)
    const filteredSessions = data.filter.year(sessions, years[years.length - 1])

    const labels = data.parse.months(filteredSessions).map(month => month.name)
    const sessionsDataset = data.parse.sessions(filteredSessions, gear)
    const usage = {
      sail: data.parse.usage(filteredSessions, 'sailSize'),
      board: data.parse.usage(filteredSessions, 'board'),
      spot: data.parse.usage(filteredSessions, 'spot')
    }

    const barChart = new BarChart(sessions, gear)
    const doughnutChart = new DoughnutChart()

    barChart.render(sessionsDataset, labels)
    sessionAmount.textContent = filteredSessions.length

    select.year.addOptions(years, e => {
      const year = e.target.value

      barChart.update(year)
      sessionAmount.textContent = barChart.sessionAmount
    })

    selectChart.addEventListener('change', e => {
      const chartType = e.target.value

      if (chartType === 'sessions') {
        doughnutChart.destroy()

        barChart.render(sessionsDataset, labels, 'bar')
      } else {
        if (barChart.chart.canvas !== null) {
          barChart.destroy()

          doughnutChart.render([{
            data: usage[chartType].map(item => item.count),
            backgroundColor: colors
          }],
          usage[chartType].map(item => item.name))
        } else {
          doughnutChart.update([{
            data: usage[chartType].map(item => item.count),
            backgroundColor: colors
          }],
          usage[chartType].map(item => item.name))
        }
      }
    })
  } catch (err) {
    console.error(err)

    const main = document.getElementsByTagName('main')[0]
    const p = element.paragraph('Something went wrong..')

    element.update(main, p)
  }
})()
