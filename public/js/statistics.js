/* global Chart */

import { data } from './modules/data.js'
// import { element } from './modules/element.js'

(async () => {
  const sessions = await data.get()
  const parsedData = data.parse.sessions(sessions)

  const test = parse(sessions)

  const dataset = [{
    label: 'Amount of sessions in a month',
    data: parsedData.map(item => item.count),
    // backgroundColor: [
    //   'rgba(255, 99, 132, 0.2)',
    //   'rgba(54, 162, 235, 0.2)',
    //   'rgba(255, 206, 86, 0.2)',
    //   'rgba(75, 192, 192, 0.2)',
    //   'rgba(153, 102, 255, 0.2)',
    //   'rgba(255, 159, 64, 0.2)'
    // ],
    // borderColor: [
    //   'rgba(255, 99, 132, 1)',
    //   'rgba(54, 162, 235, 1)',
    //   'rgba(255, 206, 86, 1)',
    //   'rgba(75, 192, 192, 1)',
    //   'rgba(153, 102, 255, 1)',
    //   'rgba(255, 159, 64, 1)'
    // ],
    borderWidth: 1
  },
  {
    label: 'Amount of sessions in a month',
    data: parsedData.map(item => item.count),
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    // backgroundColor: [
    //   'rgba(255, 99, 132, 0.2)',
    //   'rgba(54, 162, 235, 0.2)',
    //   'rgba(255, 206, 86, 0.2)',
    //   'rgba(75, 192, 192, 0.2)',
    //   'rgba(153, 102, 255, 0.2)',
    //   'rgba(255, 159, 64, 0.2)'
    // ],
    // borderColor: [
    //   'rgba(255, 99, 132, 1)',
    //   'rgba(54, 162, 235, 1)',
    //   'rgba(255, 206, 86, 1)',
    //   'rgba(75, 192, 192, 1)',
    //   'rgba(153, 102, 255, 1)',
    //   'rgba(255, 159, 64, 1)'
    // ],
    borderWidth: 1
  }]

  document.getElementById('session-amount').textContent = sessions.length

  const ctx = document.getElementById('chart').getContext('2d')

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: parsedData.map(item => item.name),
      datasets: test
    },
    options: {
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            const session = data.datasets[tooltipItem.datasetIndex].sessions[tooltipItem.index]

            return `Date: ${session.date}`
          }
        }
      },
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            precision: 0
          },
          stacked: true
        }]
      }
    }
  })
})()

function parse (sessions) {
  let dataset = []
  let lastMonth
  let index = 1
  sessions = data.sortByDate(sessions)

  sessions.forEach((session, i) => {
    const sessionMonth = parseInt(session.date.split('-')[1])

    if (i === 0) {
      dataset.push({
        data: [1],
        sessions: [session]
      })

      lastMonth = sessionMonth

      return
    }

    if (sessionMonth === lastMonth) {
      if (dataset[index]) {
        dataset[index].data.push(1)
        dataset[index].sessions.push(session)
      } else {
        dataset[index] = {
          data: [1],
          sessions: [session]
        }
      }

      index++

      console.log(dataset)

      return
    }

    if (sessionMonth === lastMonth + 1) {
      index = 0

      dataset[index].data.push(1)
      dataset[index].sessions.push(session)

      lastMonth = sessionMonth
      index++

      return
    }
  })

  console.log(dataset)

  return dataset
}
