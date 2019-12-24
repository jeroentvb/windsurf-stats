/* global Chart */

export class Graph {
  constructor (dataset) {
    this.dataset = dataset

    this.canvas = document.getElementById('chart')
    this.ctx = this.canvas.getContext('2d')

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
    const year = this.dataset.years[this.dataset.years.length - 1]
    this.dataType = dataType

    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: this.getLabels(year),
        datasets: this.getData(year)
      },
      options: {
        maintainAspectRatio: false,
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
              if (this.dataType === 'sessions' || this.dataType === undefined) {
                const session = data.datasets[tooltipItem.datasetIndex].sessions[tooltipItem.index]

                return `Date: ${session.date} Sail: ${session.sailSize}`
              } else {
                return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
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
    })
  }

  changeYear (year) {
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
