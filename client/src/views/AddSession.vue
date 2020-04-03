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
                v-model.number="session.hour"
                :items="getNumberArray(7, 21, 1)"
                label="At which hour did you sail?"
                required
                :rules="required"
                @change="setConditions(session.hour)"
                ></v-select>

                <v-select
                v-model="session.spot"
                :items="spots"
                label="Spot"
                required
                :rules="required"
                @change="getConditions(session.spot)"
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
        :loading="submitting"
        x-large
        type="submit"
        @click.prevent="submitting = true && submit()"
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
        hour: '',
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
      },
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

    async getConditions (spot: string, hour: number): Promise<void> {
      const spotId = this.$store.state.user.spots.find((spotObj: Spot) => spotObj.name === spot).id

      try {
        const res = await Api.get(`conditions/${spotId}`)
        this.conditions = res.data as Conditions[]

        if (this.session.hour) {
          this.setConditions(this.session.hour)
        }
      } catch (err) {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Couldn\'t get spot conditions',
          timeout: 5000,
          type: 'error'
        } as Snackbar)
        console.error(err)
      }
    },

    setConditions (hour: string): void {
      if (this.conditions.length === 0) return

      const conditionsHour: Conditions = this.conditions.find((condition: Conditions) => condition.hour === parseInt(hour)) as Conditions
      const { windspeed, windgust, winddirection, temperature } = conditionsHour

      this.session.conditions = {
        windspeed,
        windgust,
        winddirection,
        temperature
      }

      this.showConditions = true
    },

    submit () {
      console.log(this.session)
      // this.$router.push('/confirm-session')
    }
  }
})
</script>
