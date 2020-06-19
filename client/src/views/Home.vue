<template>
  <div class="home">
    <h1>Sessions</h1>

    <v-select
    v-model="chart.selectedYear"
    :items="years"
    label="Year"
    required
    @change="updateYear(chart.selectedYear)"
    ></v-select>

    <div id="chart-container">
      <BarChart
      :chart-data="chart.data"
      :styles="{height: '75vh'}"
      />
    </div>
    <pre>{{ sessions }}</pre>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Axios from 'axios'
import Api from '../services/api'
import Data from '../services/data'

import BarChart from '../components/BarChart.vue'

import { SHOW_SNACKBAR } from '../store/constants'
import { Snackbar, ChartData } from '../interfaces'
import { Session } from '../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'home',
  components: {
    BarChart
  },

  data () {
    return {
      chart: {
        selectedYear: '', // This is set in the created () function
        data: {},
        datasets: [] as ChartData[]
      }
    }
  },

  computed: {
    sessions (): Session[] {
      return this.$store.state.user.sessions
    },

    years (): string[] {
      const years: string[] = []
      this.sessions.forEach((session: Session, i) => {
        const year = (session.date as string).split('-')[0]

        if (i === 0) {
          years.push(year)
        } else if (years.indexOf(year) === -1) {
          years.push(year)
        }
      })

      years
        .reverse()
        .unshift('All')

      return years
    }
  },

  methods: {
    parseSessions (): ChartData[] {
      const yearDatasets: ChartData[] = []

      this.years.forEach(year => {
        if (year === 'All') return
        const sessions = this.$store.state.user.sessions.filter((session: Session) => {
          return (session.date as string).split('-')[0] === year
        })

        yearDatasets.push(Data.parse(sessions, this.$store.state.user))
      })

      return yearDatasets.reverse()
    },

    updateYear (selectedYear: string) {
      if (selectedYear === 'All') {
        console.log('All')

        return
      }

      const dataset = this.chart.datasets.filter((dataset: ChartData) => {
        return dataset.year === parseInt(selectedYear)
      })[0]

      this.chart.data = dataset
    }
  },

  created () {
    const parsedSessions = this.parseSessions()

    this.chart = {
      selectedYear: this.years[1],
      data: parsedSessions[parsedSessions.length - 1],
      datasets: parsedSessions
    }
  }
})
</script>
