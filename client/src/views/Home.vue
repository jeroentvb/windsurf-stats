<template>
  <div class="home">
    <h1>Sessions</h1>

    <div v-if="sessions.length > 0">
      <div class="d-flex">
        <v-select
        v-model="chart.selected.dataset"
        :items="DATASETS"
        label="Dataset"
        required
        @change="changeDataset(chart.selected.dataset)"
        class="pr-2"
        ></v-select>

        <v-select
        v-model="chart.selected.year"
        :items="years"
        label="Year"
        required
        @change="updateYear(chart.selected.year)"
        class="pl-2"
        ></v-select>
      </div>

      <p>
        Total amount of sessions: {{ chart.data.amount }}
      </p>

      <div id="chart-container">
        <BarChart
        :chart-data="chart.data"
        :styles="{height: '75vh'}"
        />
      </div>
    </div>

    <div v-if="sessions.length === 0">
      <p>You don't have any sessions yet :(</p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Axios from 'axios'
import Api from '../services/api'
import Data from '../services/data'

import BarChart from '../components/BarChart.vue'

import { DATASETS, SESSION_AMOUNT, SAIL_USAGE, BOARD_USAGE, SPOT_VISITS } from '../constants'
import { SHOW_SNACKBAR } from '../store/constants'
import { Snackbar, ChartData } from '../interfaces'
import { Session } from '../../../shared/interfaces/Session'
import { User } from '../../../shared/interfaces/User'

export default Vue.extend({
  name: 'home',
  components: {
    BarChart
  },

  data () {
    return {
      chart: {
        selected: {
          year: '', // This is set in the created () function
          dataset: '' as DATASETS
        },
        data: {},
        datasets: {
          [SESSION_AMOUNT]: [] as ChartData[],
          [SAIL_USAGE]: [] as ChartData[],
          [BOARD_USAGE]: [] as ChartData[],
          [SPOT_VISITS]: [] as ChartData[]
        }
      },
      DATASETS
    }
  },

  computed: {
    sessions (): Session[] {
      return this.$store.state.user.sessions
    },

    user (): User {
      return this.$store.state.user
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
    init () {
      if (this.sessions.length > 0) {
        const sessionAmount = Data.get.sessions(
          this.sessions,
          this.years,
          this.user
        )

        this.chart = {
          selected: {
            year: this.years[1],
            dataset: SESSION_AMOUNT
          },
          data: sessionAmount[sessionAmount.length - 1],
          datasets: {
            [SESSION_AMOUNT]: sessionAmount,
            [SAIL_USAGE]: Data.get.amount(this.sessions, this.years, 'sail'),
            [BOARD_USAGE]: Data.get.amount(this.sessions, this.years, 'board'),
            [SPOT_VISITS]: Data.get.amount(this.sessions, this.years, 'spot')
          }
        }
      }
    },

    updateYear (selectedYear: string) {
      if (selectedYear === 'All') {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Showing all years hasn\'t been implemented yet',
          timeout: 5000,
          type: 'info'
        } as Snackbar)

        return
      }

      const dataset: ChartData = this.chart.datasets[this.chart.selected.dataset].filter((dataset: ChartData) => {
        return dataset.year === parseInt(selectedYear)
      })[0]

      this.chart.data = dataset
    },

    changeDataset (selectedDataset: DATASETS) {
      const dataset: ChartData = this.chart.datasets[selectedDataset][this.chart.datasets[selectedDataset].length - 2]
      this.chart.data = dataset
      this.chart.selected = {
        year: dataset.year.toString(),
        dataset: selectedDataset
      }
    }
  },

  created () {
    this.init()
  }
})
</script>
