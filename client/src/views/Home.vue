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
      :data="testData"
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
import { Snackbar } from '../interfaces'
import { Session } from '../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'home',
  components: {
    BarChart
  },

  data () {
    return {
      testData: {
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
      },
      chart: {
        selectedYear: ''
      }
    }
  },

  computed: {
    sessions (): Session[] {
      return this.$store.state.user.sessions
    },

    parsedSessions () {
      return Data.parse(this.$store.state.user.sessions)
    },

    years (): string[] {
      const years: string[] = ['All']
      this.sessions.forEach((session: Session, i) => {
        const year = (session.date as string).split('-')[0]

        if (i === 0) {
          years.push(year)
        } else if (years.indexOf(year) === -1) {
          years.push(year)
        }
      })

      return years
    }
  },

  methods: {
    updateYear (year: number) {
    }
  },

  created () {
    this.chart.selectedYear = this.years[1]
    console.log(this.parsedSessions)
  }
})
</script>
