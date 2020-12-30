<template>
  <v-container>
    <v-layout column>
      <v-layout row wrap>
        <v-flex md6 pa-4>
          <ThresholdForm
          :oldThreshold="threshold"
          @updateThreshold="updateThreshold"
          :submitting="submitting.threshold" />
        </v-flex>

        <v-flex md6 pa-4>
          <EmailForm
            :oldEmail="email"
            @updateEmail="updateEmail"
            :submitting="submitting.email"
          />
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import snackbar from '../services/snackbar'
import helper from '../services/helper'

import ThresholdForm from '../components/ui/form/preferences/ThresholdForm.vue'
import EmailForm from '../components/ui/form/preferences/EmailForm.vue'

import { Spot, User } from '../../../shared/interfaces'
import { UPDATE_EMAIL, UPDATE_THRESHOLD } from '../store/constants'

export default Vue.extend({
  name: 'Preferences',

  components: {
    ThresholdForm,
    EmailForm
  },

  computed: {
    threshold (): number {
      return this.$store.state.user.threshold
    },
    email (): string {
      return this.$store.state.user.email
    }
  },

  data () {
    return {
      submitting: {
        threshold: false,
        email: false
      }
    }
  },

  methods: {
    async updateThreshold (threshold: number) {
      this.submitting.threshold = true

      try {
        await this.$store.dispatch(UPDATE_THRESHOLD, threshold)

        snackbar.succes('Saved successfully')
        this.submitting.threshold = false
      } catch (err) {
        snackbar.error()

        this.submitting.threshold = false
      }
    },

    async updateEmail (payload: Partial<User>) {
      this.submitting.email = true

      try {
        await this.$store.dispatch(UPDATE_EMAIL, payload)

        snackbar.succes('Saved successfully')
        this.submitting.email = false
      } catch (err) {
        this.submitting.email = false

        if (err.response.status === 409) {
          snackbar.error('E-mail address is in an incorrect format, or already taken', 10000)
          return
        } else if (err.response.status === 401) {
          snackbar.error('Incorrect password')
          return
        }

        snackbar.error()
      }
    }
  }
})
</script>
