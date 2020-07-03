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

      <div id="legend" class="d-flex pb-4">
        <div
        v-for="legend in chart.data.legend"
        :key="legend.item"
        class="legend-item pr-8">
          <div
          :style="{ backgroundColor: legend.color }"
          class="legend-color mr-2"></div>
          {{ legend.item }}
        </div>
      </div>

      <div id="chart-container">
        <BarChart
        :chart-data="chart.data"
        :styles="{height: '75vh'}"
        />
      </div>

      <v-btn
      color="primary"
      class="my-4"
      medium
      to="/all-statistics">All statistics</v-btn>
    </div>

    <div v-if="sessions.length === 0">
      <p>You don't have any sessions yet :(</p>

      <v-btn
      v-if="!showOldSessionsForm"
      color="primary"
      class="my-4"
      medium
      @click="showOldSessionsForm = true">
      Upload old sessions
      </v-btn>

      <v-container fluid v-if="showOldSessionsForm">
        <v-layout column>
          <v-layout row wrap>
            <v-flex md6 pa-4>
              <OldSessions @uploadOldSessions="uploadOldSessions" />
            </v-flex>
          </v-layout>
        </v-layout>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Axios from 'axios'
import Api from '../services/api'
import Data from '../services/data'

import BarChart from '../components/BarChart.vue'
import OldSessions from '../components/form/OldSessions.vue'

import { DATASETS, SESSION_AMOUNT, SAIL_USAGE, BOARD_USAGE, SPOT_VISITS } from '../constants'
import { SHOW_SNACKBAR } from '../store/constants'
import { Snackbar, ChartData } from '../interfaces'
import { Session } from '../../../shared/interfaces/Session'
import { User } from '../../../shared/interfaces/User'

export default Vue.extend({
  name: 'home',
  components: {
    BarChart,
    OldSessions
  },

  data () {
    return {
      showOldSessionsForm: false,
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
        const data = new Data(this.sessions, this.years, this.user)
        const sessionAmount = data.parseSessions()

        console.log(data.parseSessions()[0].legend)

        this.chart = {
          selected: {
            year: this.years[1],
            dataset: SESSION_AMOUNT
          },
          data: sessionAmount[sessionAmount.length - 2],
          datasets: {
            [SESSION_AMOUNT]: sessionAmount,
            [SAIL_USAGE]: data.parseAmount('sail'),
            [BOARD_USAGE]: data.parseAmount('board'),
            [SPOT_VISITS]: data.parseAmount('spot')
          }
        }
      }
    },

    updateYear (selectedYear: string) {
      const dataset: ChartData = this.chart.datasets[this.chart.selected.dataset].filter((dataset: ChartData) => {
        return dataset.year === (
          selectedYear === 'All' ? 0 : parseInt(selectedYear)
        )
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
    },

    async uploadOldSessions (oldSessions: object) {
      try {
        const res = await Api.post('old-sessions', oldSessions)

        if (res.status === 200) {
          this.$router.go(0)
        }
      } catch (err) {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Something went wrong!',
          timeout: 5000,
          type: 'error'
        } as Snackbar)
      }
    }
  },

  created () {
    this.init()
  }
})
</script>

<style lang="scss" scoped>
.legend-item {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.legend-color {
  width: 2em;
  height: 2em;
}
</style>
