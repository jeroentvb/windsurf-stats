<script lang="ts">
import Vue from 'vue'
import { Bar } from 'vue-chartjs'

export default Vue.extend({
  name: 'BarChart',
  extends: Bar,

  props: {
    data: Array
  },

  mounted () {
    this.renderChart(this.data, {
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      }
    })
  }
})
</script>
