<script lang="ts">
import Vue from 'vue'
import { Bar } from 'vue-chartjs'

export default Vue.extend({
  name: 'BarChart',
  extends: Bar,

  props: {
    data: Object
  },

  mounted () {
    this.renderChart(this.data, {
      maintainAspectRatio: false,
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
    })
  }
})
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
