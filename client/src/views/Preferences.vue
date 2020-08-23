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
import api from '../services/api'
import snackbar from '../services/snackbar'
import helper from '../services/helper'

import ThresholdForm from '../components/ui/form/ThresholdForm.vue'

import { Spot } from '../../../shared/interfaces/Spot'
import { UPDATE_THRESHOLD } from '../store/constants'

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
        const res = await api.post('threshold', { threshold })

        if (res.status === 200) {
          this.$store.commit(UPDATE_THRESHOLD, threshold)
          snackbar.succes('Saved succesfully')

          this.submitting = false
        }
      } catch (err) {
        snackbar.error()

        this.submitting = false
      }
    }
  }
})
</script>
