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
                v-model="session.hour"
                :items="getNumberArray(7, 21, 1)"
                label="At which hour did you sail?"
                required
                :rules="required"
                ></v-select>

                <v-select
                v-model="session.spot"
                :items="spots"
                label="Spot"
                required
                :rules="required"
                ></v-select>

                <v-select
                v-model="session.sail"
                :items="sails"
                label="Sail"
                required
                :rules="required"
                ></v-select>

                <v-select
                v-model="session.board"
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

        <v-flex xs12 md6 pa-4>
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

import { Sail, Board } from '../../../shared/interfaces/Gear'
import { Spot } from '../../../shared/interfaces/User'

export default Vue.extend({
  name: 'AddSession',

  data () {
    return {
      session: {
        hour: '',
        spot: '',
        sail: '',
        board: '',
        rating: '',
        note: ''
      },
      required: [
        (v: string) => !!v || 'All fields are required'
      ],
      submitting: false
    }
  },

  computed: {
    spots () {
      return this.$store.state.user.spots.map((spot: Spot) => spot.name)
    },

    sails () {
      return this.$store.state.user.gear.sails.map((sail: Sail) => `${sail.brand} ${sail.model} ${sail.size}`)
    },

    boards () {
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

    submit () {
      this.$router.push('/confirm-session')
    }
  }
})
</script>
