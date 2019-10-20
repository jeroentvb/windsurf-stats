/* global Chart */

import { data } from './data.js'

export class Graph {
  constructor (dataset) {
    this.dataset = dataset

    this.canvas = document.getElementById('chart')
    this.ctx = this.canvas.getContext('2d')

    this.sessionAmount = document.getElementById('session-amount')

    this.options = {
      legend: {
        display: false
      },
      tooltips: {
        enabled: this.dataType === 'sessions' || this.dataType === undefined,
        custom: tooltip => {
          if (!tooltip) return
          tooltip.displayColors = false
        },
        callbacks: {
          label: (tooltipItem, data) => {
            if (this.dataType === 'sessions' || this.dataType === undefined) {
              const session = data.datasets[tooltipItem.datasetIndex].sessions[tooltipItem.index]

              return `Date: ${session.date} Sail: ${session.sailSize}`
            }
          },
          title: (tooltipItem, data) => {

          }
        }
      },
      scales: {
        xAxes: [{
          stacked: this.dataType === 'sessions' || this.dataType === undefined
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            precision: 0
          },
          stacked: this.dataType === 'sessions' || this.dataType === undefined
        }]
      }
    }

    this.colors = [
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
  }

  render (dataType) {
    this.dataType = dataType
    this.sessionAmount.textContent = this.dataset.sessions.all.length

    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: this.getLabels('all'),
        datasets: this.getData('all')
      },
      options: this.options
    })
  }

  changeYear (year) {
    console.log(this.sessionAmount.textContent, this.dataset.sessions[year])
    if (this.dataType === 'sessions') this.sessionAmount.textContent = this.dataset.sessions[year].length

    // Using .pop() removes the last item of the label array for some reason
    // this.chart.data.labels.pop()
    // this.chart.data.datasets.forEach(dataset => {
    //   dataset.data.pop()
    // })

    this.chart.data.labels = this.getLabels(year)
    this.chart.data.datasets = this.getData(year)

    this.chart.update(0)
  }

  destroy () {
    this.chart.destroy()
  }

  getLabels (year) {
    return this.dataType === 'sessions' ? this.dataset.labels[year] : this.dataset[this.dataType][year].map(x => x.name)
  }

  getData (year) {
    return this.dataType === 'sessions' ? this.dataset[this.dataType][year] : [{
      data: this.dataset[this.dataType][year].map(x => x.count),
      backgroundColor: this.dataset[this.dataType][year].map((x, i) => this.colors[i])
    }]
  }
}

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
            return `${data.labels[tooltipItem.index]}m2 usage: ${data.datasets[0].data[tooltipItem.index]}x`
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
