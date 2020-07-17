<template>
  <v-container>
    <v-layout column>
      <v-layout row wrap>
        <v-flex md6 pa-4>
          <ThresholdForm
          :oldThreshold="threshold"
          @updateThreshold="updateThreshold"
          :submitting="submitting" />
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Api from '../services/api'

import ThresholdForm from '../components/form/ThresholdForm.vue'

import helper from '../services/helper'

import { Spot } from '../../../shared/interfaces/Spot'
import { UPDATE_SPOTS, SHOW_SNACKBAR, UPDATE_THRESHOLD } from '../store/constants'
import { Snackbar } from '../interfaces'

export default Vue.extend({
  name: 'Preferences',

  components: {
    ThresholdForm
  },

  computed: {
    threshold (): number {
      return this.$store.state.user.threshold
    }
  },

  data () {
    return {
      submitting: false
    }
  },

  methods: {
    async updateThreshold (threshold: number) {
      this.submitting = true

      try {
        const res = await Api.post('threshold', { threshold })

        if (res.status === 200) {
          this.$store.commit(UPDATE_THRESHOLD, threshold)
          this.$store.commit(SHOW_SNACKBAR, {
            text: 'Saved succesfully',
            type: 'succes'
          } as Snackbar)

          this.submitting = false
        }
      } catch (err) {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Something went wrong!',
          timeout: 5000,
          type: 'error'
        } as Snackbar)

        this.submitting = false
      }
    }
  }
})
</script>
