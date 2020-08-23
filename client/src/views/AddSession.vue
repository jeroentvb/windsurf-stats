<template>
  <v-container>
    <v-form
      :disabled="localState.submitting">
      <v-layout row wrap>
        <v-flex xs12 md6 pa-4>
          <v-card>
            <v-card-title>Session details</v-card-title>
            <v-card-text>
              <SessionDetailsForm
                v-model="session"
                @loadingSpotData="localState.loadingSpotData = arguments[0]"
              />
            </v-card-text>

            <v-progress-linear
              v-if="localState.loadingSpotData"
              indeterminate
              color="primary"
            ></v-progress-linear>
          </v-card>
        </v-flex>

        <v-flex xs12 md6 pa-4>
          <v-card>
            <v-card-title>What gear did you use?</v-card-title>
            <v-card-text>
              <SessionGearForm
                v-model="session"
                :sails="sails"
                :boards="boards"
              />
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

      <FormError
        v-if="localState.formErrorMsg"
        :msg="localState.formErrorMsg"
      />

      <v-layout>
        <v-btn
        :block="true"
        color="primary"
        x-large
        type="submit"
        :loading="localState.submitting"
        @click.prevent="submit()"
        >Submit</v-btn>
      </v-layout>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Api from '../services/api'
import helper from '../services/helper'
import snackbar from '../services/snackbar'

import SessionDetailsForm from '@/components/ui/form/SessionDetailsForm.vue'
import SessionGearForm from '@/components/ui/form/SessionGearForm.vue'
import FormError from '@/components/ui/FormError.vue'

import { Sail, Board } from '../../../shared/interfaces/Gear'
import { Spot } from '../../../shared/interfaces/Spot'
import { Session, Conditions } from '../../../shared/interfaces/Session'

import { ADD_SESSION } from '../store/constants'

export default Vue.extend({
  name: 'AddSession',

  components: {
    SessionDetailsForm,
    SessionGearForm,
    FormError
  },

  data () {
    return {
      session: {
        date: new Date().toISOString().substr(0, 10),
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
      required: [
        (v: string) => !!v || 'All fields are required'
      ],
      localState: {
        loadingSpotData: false,
        submitting: false,
        formErrorMsg: ''
      }
    }
  },

  computed: {
    sails (): string[] {
      return this.$store.state.user.gear.sails.map((sail: Sail) => `${sail.brand} ${sail.model} ${sail.size}`)
    },

    boards (): string[] {
      return this.$store.state.user.gear.boards.map((board: Board) => `${board.brand} ${board.model} ${board.volume}`)
    }
  },

  created () {
    this.session.gear.sail = this.sails[0]
    this.session.gear.board = this.boards[0]
  },

  methods: {
    validateForm () {
      let valid: boolean = true
      const form: Session = this.session

      for (const [key, value] of Object.entries(form.time)) {
        if (!value) valid = false
      }

      for (const [key, value] of Object.entries(form.conditions)) {
        if (!value) valid = false
      }

      if (!form.spot) valid = false

      return valid
    },

    async submit () {
      if (!this.validateForm()) {
        this.localState.formErrorMsg = 'Please fill in the required fields'
        return
      }

      const session = Object.assign({}, this.session, { date: new Date(this.session.date).toISOString() })
      this.submittingForm(true)

      try {
        const res = await Api.post('session', session)

        if (res.status === 200) {
          this.$store.dispatch(ADD_SESSION, session)

          this.submittingForm(false)
        }
      } catch (err) {
        this.submittingForm(false)

        if (err.response.status === 422) {
          this.localState.formErrorMsg = 'Please fill in the required fields'
          return
        }

        snackbar.error()
      }
    },

    submittingForm (bool: boolean) {
      this.localState.submitting = bool
    }
  }
})
</script>
