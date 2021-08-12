<template>
  <v-layout column>
    <h3 class="mt-4">When did you sail?</h3>
    <v-menu
      v-model="showDatePicker"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="visibleDate"
          label="Date"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="session.date"
        :max="new Date().toISOString().substr(0, 10)"
        @input="showDatePicker = false"
      ></v-date-picker>
    </v-menu>

    <v-select
      v-model.number="session.time.start"
      :items="session.time.end ? getNumberArray(7, session.time.end, 1) : getNumberArray(7, 21, 1)"
      label="Starting hour"
      required
      :rules="required"
      @change="setConditions(session.time.start, session.time.start)"
    ></v-select>

    <v-select
      v-model.number="session.time.end"
      :items="session.time.start ? getNumberArray(session.time.start, 21, 1) : getNumberArray(7, 21, 1)"
      label="End hour"
      required
      :rules="required"
      @change="setConditions(session.time.start, session.time.end)"
    ></v-select>

    <h3 class="mt-4">Where did you sail?</h3>
    <v-select
      v-model="session.spot"
      :items="spots"
      label="Spot"
      required
      :rules="required"
      @change="changeSpot(session.spot)"
      :disabled="loadingData"
    ></v-select>

    <v-select
      v-if="models.length > 0"
      v-model="forecastModel"
      :items="modelNames"
      label="Forecast model name"
      required
      :rules="required"
      @change="setConditions(session.time.start, session.time.end)"
      :disabled="loadingData"
    ></v-select>

    <div v-if="showConditions" class="mt-8">
      <v-text-field
        v-model.number="session.conditions.windspeed"
        label="Windspeed"
        type="number"
        required
        :rules="required"
      ></v-text-field>

      <v-text-field
        v-model.number="session.conditions.windgust"
        label="Windgust"
        type="number"
        required
        :rules="required"
      ></v-text-field>

      <v-text-field
        v-model.number="session.conditions.winddirection"
        label="Winddirection"
        type="number"
        required
        :rules="required"
      ></v-text-field>

      <v-text-field
        v-model.number="session.conditions.temperature"
        label="Temperature"
        type="number"
        required
        :rules="required"
      ></v-text-field>

      <p>Forecast from <a :href="'https://www.windguru.cz/' + selectedSpot" target="_blank">windguru</a></p>
    </div>

    <!-- Add fields for wave spot info -->
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue'

import api from '@/services/api'
import helper from '@/services/helper'
import snackbar from '@/services/snackbar'

import { Spot, Session, Conditions, WindguruConditions, WindguruModelHour } from '../../../../../../shared/interfaces'

export default Vue.extend({
  name: 'SessionDetailsForm',

  props: {
    value: Object as () => Session
  },

  computed: {
    session: {
      get (): Session {
        return this.value
      },
      set (value: Session): void {
        this.$emit('input', value)
      }
    },

    date (): Session['date'] {
      return this.session.date
    },

    spots (): string[] {
      return this.$store.state.user.spots.map((spot: Spot) => spot.name)
    },

    getNumberArray () {
      return helper.getNumberArray
    },

    modelNames (): string[] {
      return this.models.map(model => model.name)
    }
  },

  data () {
    return {
      visibleDate: 'Today',
      showConditions: false,
      showDatePicker: false,
      loadingData: false,
      conditions: [] as Conditions[],
      forecastModel: '',
      models: [] as WindguruConditions[],
      selectedSpot: null,
      required: [
        (v: string) => !!v || 'All fields are required'
      ]
    }
  },

  watch: {
    date () {
      this.visibleDate = new Date(this.date).toLocaleDateString()
    }
  },

  created () {
    const today = new Date().toISOString().substr(0, 10)
    if (this.date !== today) {
      this.visibleDate = new Date(this.date).toLocaleDateString()
    }

    if (this.session.conditions.windspeed !== 0) {
      this.showConditions = true
    }
  },

  methods: {
    changeSpot (spot: string) {
      const windguru = this.$store.state.user.spots.find((spotObj: Spot) => spotObj.name === spot).windguru
      const today = new Date().toISOString().substr(0, 10)

      if (!windguru || this.date !== today) {
        this.showConditions = true
        return
      }

      this.getConditions(spot)
    },

    async getConditions (spot: string): Promise<void> {
      const spotId = this.$store.state.user.spots.find((spotObj: Spot) => spotObj.name === spot).id
      this.loadingSpotData(true)

      this.selectedSpot = spotId

      try {
        const res = await api.get(`conditions?spot=${spotId}`)
        const models: WindguruConditions[] = res.data
        this.models = models
        this.forecastModel = helper.getHighestResolutionModel(this.modelNames)

        // If the session time is set, update the conditions in the form
        if (this.session.time.start && this.session.time.end) {
          this.setConditions(this.session.time.start, this.session.time.end)
        }

        this.loadingSpotData(false)
      } catch (err) {
        this.loadingSpotData(false)
        this.showConditions = true

        if (err.response && err.response.status === 404) {
          snackbar.error('The selected spot doesn\'t isn\'t a windguru spot', 6000)
          return
        }

        snackbar.error('Couldn\'t get spot conditions')
      }
    },

    setConditions (start: number, end: number): void {
      if (this.models.length === 0) return
      if (!this.session.time.start || !this.session.time.end) return

      const conditions: Conditions[] = this.models
        .filter((model: WindguruConditions) => model.name === this.forecastModel)[0].hours
        .filter((hour: WindguruModelHour) => {
          const hourNumber = parseInt(hour.hour)
          return hourNumber >= start && hourNumber <= end
        })
        .map((hour: WindguruModelHour) => ({
          hour: hour.hour === '-' ? 0 : parseInt(hour.hour),
          windspeed: helper.parseNumber(hour.wspd),
          windgust: helper.parseNumber(hour.gust),
          winddirection: helper.parseNumber(hour.wdeg),
          temperature: helper.parseNumber(hour.tmp)
        }))

      if (conditions.length < 1) {
        this.showConditions = true
        snackbar.error('Couldn\'t get wind data for the selected session time and model')
        return
      }

      const averageConditions: Conditions = helper.calcAverageConditions(conditions)

      this.session.conditions = averageConditions
      this.showConditions = true
    },

    loadingSpotData (bool: boolean) {
      this.loadingData = bool
      this.$emit('loadingSpotData', bool)
    }
  }
})
</script>
