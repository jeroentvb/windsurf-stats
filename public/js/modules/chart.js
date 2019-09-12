/* global Chart */

import { data } from './data.js'

export class BarChart {
  constructor (sessions, gear) {
    this.sessions = sessions
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

    this.canvas = document.getElementById('chart')
  }

  render (dataset, labels) {
    const ctx = this.canvas.getContext('2d')

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

  destroy () {
    this.chart.destroy()
  }
}

export class DoughnutChart {
  constructor () {
    this.canvas = document.getElementById('chart')

    this.options = {
      tooltips: {
        custom: tooltip => {
          if (!tooltip) return
          tooltip.displayColors = false
        },
        callbacks: {
          label: (tooltipItem, data) => {
            return `${data.labels[tooltipItem.index]}: ${data.datasets[0].data[tooltipItem.index]}x`
          }
        }
      }
    }
  }

  render (dataset, labels) {
    const ctx = this.canvas.getContext('2d')

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: dataset
      },
      options: this.options
    })
  }

  update (dataset, labels) {
    this.chart.data.labels.pop()
    this.chart.data.datasets.forEach(dataset => {
      dataset.data.pop()
    })

    this.chart.data.labels = labels
    this.chart.data.datasets = dataset

    this.chart.update()
  }

  destroy () {
    this.chart.destroy()
  }
}