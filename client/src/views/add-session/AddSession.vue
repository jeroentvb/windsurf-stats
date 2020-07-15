<template src="./AddSession.html"></template>

<script lang="ts">
import Vue from 'vue'
import Api from '../../services/api'
import helper from '../../services/helper'

import { Sail, Board } from '../../../../shared/interfaces/Gear'
import { Spot } from '../../../../shared/interfaces/Spot'
import { Session, Conditions } from '../../../../shared/interfaces/Session'
import { Snackbar } from '../../interfaces'

import { SHOW_SNACKBAR, ADD_SESSION } from '../../store/constants'

export default Vue.extend({
  name: 'AddSession',

  data () {
    return {
      date: new Date().toISOString().substr(0, 10),
      visibleDate: 'Today',
      session: {
        date: new Date(),
        time: {
          start: 0,
          end: 0
        },
        spot: '',
        gear: {
          sail: '',
          board: ''
        },
        conditions: {
          windspeed: 0,
          windgust: 0,
          winddirection: 0,
          temperature: 0
        },
        rating: 7,
        note: ''
      } as Session,
      conditions: [] as Conditions[],
      showConditions: false,
      showDatePicker: false,
      required: [
        (v: string) => !!v || 'All fields are required'
      ],
      submitting: false,
      loadingSpotData: false
    }
  },

  computed: {
    spots (): string[] {
      return this.$store.state.user.spots.map((spot: Spot) => spot.name)
    },

    sails (): string[] {
      return this.$store.state.user.gear.sails.map((sail: Sail) => `${sail.brand} ${sail.model} ${sail.size}`)
    },

    boards (): string[] {
      return this.$store.state.user.gear.boards.map((board: Board) => `${board.brand} ${board.model} ${board.volume}`)
    },

    getNumberArray () {
      return helper.getNumberArray
    }
  },

  watch: {
    date () {
      this.visibleDate = new Date(this.date).toLocaleDateString()
    }
  },

  created () {
    this.session.gear.sail = this.sails[0]
    this.session.gear.board = this.boards[0]
  },

  methods: {
    changeSpot (spot: string) {
      const windfinder = this.$store.state.user.spots.find((spotObj: Spot) => spotObj.name === spot).windfinder
      const today = new Date().toISOString().substr(0, 10)

      if (!windfinder || this.date !== today) {
        this.showConditions = true
        return
      }

      this.getConditions(spot)
    },

    async getConditions (spot: string): Promise<void> {
      const spotId = this.$store.state.user.spots.find((spotObj: Spot) => spotObj.name === spot).id
      this.loadingSpotData = true

      try {
        const res = await Api.get(`conditions?spot=${spotId}`)
        this.conditions = res.data as Conditions[]

        // If the session time is set, update the conditions in the form
        if (this.session.time.start && this.session.time.end) {
          this.setConditions(this.session.time.start, this.session.time.end)
        }

        this.loadingSpotData = false
      } catch (err) {
        this.loadingSpotData = false

        if (err.response.status === 404) {
          this.$store.commit(SHOW_SNACKBAR, {
            text: 'The selected spot doesn\'t have a windfinder superforecast',
            timeout: 6000,
            type: 'error'
          } as Snackbar)
          return
        }

        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Couldn\'t get spot conditions',
          timeout: 5000,
          type: 'error'
        } as Snackbar)
      }
    },

    setConditions (start: number, end: number): void {
      if (this.conditions.length === 0) return
      if (!this.session.time.start || !this.session.time.end) return

      const conditions: Conditions[] = this.conditions.filter((condition: Conditions) => {
        return condition.hour as number >= start && condition.hour as number <= end
      })

      const averageConditions: Conditions = this.calcAverageConditions(conditions)
      this.session.conditions = averageConditions

      this.showConditions = true
    },

    calcAverageConditions (conditions: Conditions[]): Conditions {
      return conditions.reduce((prev, condition, i) => {
        const c: Conditions = {
          windspeed: prev.windspeed + condition.windspeed,
          windgust: prev.windgust + condition.windgust,
          winddirection: prev.winddirection + condition.winddirection,
          temperature: prev.temperature + condition.temperature
        }

        if (i === conditions.length - 1) {
          return {
            windspeed: Math.round(c.windspeed / i),
            windgust: Math.round(c.windgust / i),
            winddirection: Math.round(c.winddirection / i),
            temperature: Math.round(c.temperature / i)
          }
        }

        return c
      })
    },

    async submit () {
      const session = Object.assign(this.session, { date: new Date(this.date).toISOString() })
      this.submitting = true

      try {
        const res = await Api.post('session', session)

        if (res.status === 200) {
          this.$store.dispatch(ADD_SESSION, session)

          this.submitting = false
        }
      } catch (err) {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Something went wrong',
          timeout: 5000,
          type: 'error'
        } as Snackbar)

        this.submitting = false
      }
    }
  }
})
</script>
