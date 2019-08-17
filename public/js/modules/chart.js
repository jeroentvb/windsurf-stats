/* global Chart */

function render (dataset, labels) {
  const ctx = document.getElementById('chart').getContext('2d')

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(month => month.name),
      datasets: dataset
    },
    options: {
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
  })

  return chart
}

function update (chart) {
  
}

export const chart = {
  render
}
