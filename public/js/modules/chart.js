/* global Chart */

import { data } from './data.js'

export class BarChart {
  constructor (data, gear) {
    this.sessions = data
    this.gear = gear

    this.options = {
      legend: {
        display: false
      },
      tooltips: {
        custom: tooltip => {
          if (!tooltip) return
          tooltip.displayColors = false
        },
        callbacks: {
          label: (tooltipItem, data) => {
            const session = data.datasets[tooltipItem.datasetIndex].sessions[tooltipItem.index]

            return `Date: ${session.date} Sail: ${session.sailSize}`
          },
          title: (tooltipItem, data) => {

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
  }

  init () {
    this.years = data.get.years(this.sessions)

    const filteredSessions = data.filter.year(this.sessions, this.years[this.years.length - 1])

    const labels = data.parse.months(filteredSessions).map(month => month.name)
    const dataset = data.parse.sessions(filteredSessions, this.gear)

    this.sessionAmount = filteredSessions.length

    this.render(dataset, labels)
  }

  render (dataset, labels) {
    const ctx = document.getElementById('chart').getContext('2d')

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataset
      },
      options: this.options
    })
  }

  update (year) {
    let dataset
    let labels
    let filteredData

    if (year === 'all') {
      dataset = data.parse.sessions(this.sessions, this.gear)
      labels = data.parse.months(this.sessions).map(item => item.name)
    } else {
      filteredData = data.filter.year(this.sessions, year)
      dataset = data.parse.sessions(filteredData, this.gear)
      labels = data.parse.months(filteredData).map(item => item.name)
    }

    this.sessionAmount = filteredData ? filteredData.length : this.sessions.length

    this.chart.data.labels.pop()
    this.chart.data.datasets.forEach(dataset => {
      dataset.data.pop()
    })

    this.chart.data.labels = labels
    this.chart.data.datasets = dataset

    this.chart.update()
  }
}
