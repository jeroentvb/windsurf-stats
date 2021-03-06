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

      <div id="legend" class="d-flex flex-wrap row pb-4">
        <div
        v-for="legend in chart.data.legend"
        :key="legend.item"
        class="legend-item pr-8 pt-0 col">
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
          :datasetId="chart.selected.dataset"
          @openSession="openSessionCard"
        />
      </div>
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

    <dialog-component v-model="sessionCard.show">
      <SessionCard
        :session="sessionCard.selectedSession"
        @close="sessionCard.show = false"
      />
    </dialog-component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import api from '../services/api'
import Data from '../services/data'
import snackbar from '../services/snackbar'

import BarChart from '../components/feature/BarChart.vue'
import DialogComponent from '../components/ui/DialogComponent.vue'
import SessionCard from '../components/ui/SessionCard.vue'
import OldSessions from '../components/ui/form/session/OldSessions.vue'

import { DATASETS, SESSION_AMOUNT, SAIL_USAGE, BOARD_USAGE, SPOT_VISITS, SESSION_RATING, ALL } from '../constants'
import { ChartData } from '../interfaces'
import { User, Session } from '../../../shared/interfaces'

export default Vue.extend({
  name: 'home',

  components: {
    BarChart,
    SessionCard,
    DialogComponent,
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
          [SESSION_RATING]: [] as ChartData[],
          [SAIL_USAGE]: [] as ChartData[],
          [BOARD_USAGE]: [] as ChartData[],
          [SPOT_VISITS]: [] as ChartData[]
        }
      },
      DATASETS,
      sessionCard: {
        show: false,
        selectedSession: {}
      }
    }
  },

  computed: {
    sessions (): Session[] {
      return JSON.parse(JSON.stringify(this.$store.state.user.sessions))
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
        const sessionAmount = data.getSessionAmountDataset()

        this.chart = {
          selected: {
            year: this.years[1],
            dataset: SESSION_AMOUNT
          },
          data: sessionAmount[sessionAmount.length - 2],
          datasets: {
            [SESSION_AMOUNT]: sessionAmount,
            [SESSION_RATING]: data.getRatingDataset(),
            [SAIL_USAGE]: data.getAmountDataset('sail'),
            [BOARD_USAGE]: data.getAmountDataset('board'),
            [SPOT_VISITS]: data.getAmountDataset('spot')
          }
        }
      }
    },

    updateYear (selectedYear: string) {
      const dataset: ChartData = this.chart.datasets[this.chart.selected.dataset].filter((dataset: ChartData) => {
        return dataset.year === (
          selectedYear === ALL ? 0 : parseInt(selectedYear)
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
        const res = await api.post('old-sessions', oldSessions)

        if (res.status === 200) {
          this.$router.go(0)
        }
      } catch (err) {
        snackbar.error()
      }
    },

    openSessionCard (session: Session) {
      this.sessionCard.selectedSession = session
      this.sessionCard.show = true
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
  min-width: 14em;
}

.legend-color {
  width: 2em;
  height: 2em;
}
</style>
