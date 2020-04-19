<template>
  <v-container>
    <v-form>
      <v-layout row wrap>
        <v-flex xs12 md6 pa-4>
          <v-card>
            <v-card-title>Session details</v-card-title>
            <v-card-text>
              <v-layout column>
                <v-select
                v-model="session.spot"
                :items="spots"
                label="Spot"
                required
                :rules="required"
                @change="getConditions(session.spot)"
                ></v-select>

                <h3 class="mt-4">When did you sail?</h3>
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

                <div v-if="showConditions" class="mt-8">
                  <!-- <h3 v-if="!showConditions">Conditions at the hour you sailed</h3> -->
                  <!-- <v-row class="mt-4">
                    <v-progress-circular
                    indeterminate
                    color="primary"
                    class="ml-4"
                    ></v-progress-circular>
                    <p class="ml-4">Loading</p>
                  </v-row> -->

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
                </div>

                <!-- Add fields for wave spot info -->
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>

        <v-flex xs12 md6 pa-4>
          <v-card>
            <v-card-title>What gear did you use?</v-card-title>
            <v-card-text>
              <v-layout column>
                <v-select
                v-model="session.gear.sail"
                :items="sails"
                label="Sail"
                required
                :rules="required"
                ></v-select>

                <v-select
                v-model="session.gear.board"
                :items="boards"
                label="Board"
                required
                :rules="required"
                ></v-select>

                <v-select
                v-model="session.rating"
                label="Rating"
                :items="getNumberArray(1, 10, 0.5)"
                required
                :rules="required"
                ></v-select>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>

        <v-flex xs12 pa-4>
          <v-card>
            <v-card-text>
              <v-layout column>
                <v-textarea
                  v-model="session.note"
                  label="How was your session?"
                ></v-textarea>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>

      <v-layout>
        <v-btn
        :block="true"
        color="primary"
        x-large
        type="submit"
        @click.prevent="submit()"
        >Submit</v-btn>
      </v-layout>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Api from '../services/api'

import { Sail, Board } from '../../../shared/interfaces/Gear'
import { Spot } from '../../../shared/interfaces/Spot'
import { Session, Conditions } from '../../../shared/interfaces/Session'
import { Snackbar } from '../interfaces'

import { SHOW_SNACKBAR } from '../store/constants'

export default Vue.extend({
  name: 'AddSession',

  data () {
    return {
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
        rating: '',
        note: ''
      } as Session,
      conditions: [] as Conditions[],
      showConditions: false,
      required: [
        (v: string) => !!v || 'All fields are required'
      ],
      submitting: false
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
    }
  },

  methods: {
    getNumberArray (start: number, end: number, step: number): number[] {
      const numbers: number[] = []
      for (let i = start; i < (end + step); i += step) {
        numbers.push(i)
      }
      return numbers
    },

    async getConditions (spot: string, time: Session['time']): Promise<void> {
      const spotId = this.$store.state.user.spots.find((spotObj: Spot) => spotObj.name === spot).id

      try {
        const res = await Api.get(`conditions?spot=${spotId}`)
        this.conditions = res.data as Conditions[]

        // If the session time is set, update the conditions in the form
        if (this.session.time.start && this.session.time.end) {
          this.setConditions(this.session.time.start, this.session.time.end)
        }
      } catch (err) {
        /**
         * TODO
         * This can be removed if non windfinder spots are added properly.
         */
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
        console.error(err)
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
      try {
        const res = await Api.post(`session`, this.session)

        if (res.status === 200) {
          this.$router.push('/')
        }
      } catch (err) {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Something went wrong',
          timeout: 5000,
          type: 'error'
        } as Snackbar)
        console.error(err)
      }
    }
  }
})
</script>
