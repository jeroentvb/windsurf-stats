<script>
import Vue from 'vue'
import { Bar, mixins } from 'vue-chartjs'

export default {
  name: 'BarChart',
  extends: Bar,
  mixins: [mixins.reactiveProp],

  // watch: {
  //   chartData () {
  //     console.log(this.chartData)
  //   }
  // },

  data () {
    return {
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
              if (data.datasets[tooltipItem.datasetIndex].sessions) {
                const session = data.datasets[tooltipItem.datasetIndex].sessions[tooltipItem.index]

                return `Date: ${new Date(session.date).toLocaleDateString()} Sail: ${session.gear.sail}`
              } else {
                return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
              }
            },
            title: (tooltipItem, data) => {}
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
  },

  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>

<!--
The chart wants the data and labels in the following format:
{
  labels: ['Risk Level', 'test'],
  datasets: [
    {
      label: 'Low',
      data: [67.8, 2],
      backgroundColor: '#D6E9C6' // green
    },
    {
      label: 'Moderate',
      data: [20.7],
      backgroundColor: '#FAEBCC' // yellow
    },
    {
      label: 'High',
      data: [11.4],
      backgroundColor: '#EBCCD1' // red
    }
  ]
}

Each new label and each new value in the data array is a new column
-->
