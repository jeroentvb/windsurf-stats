<template>
  <v-container>
    <v-layout column>
      <v-layout row wrap>
        <v-flex md6 pa-4>
          <SpotForm
          :spots="spots"
          @updateSpots="updateSpots"
          :submitting="submitting" />
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import snackbar from '../services/snackbar'

import SpotForm from '../components/ui/form/SpotForm.vue'

import helper from '../services/helper'

import { Spot } from '../../../shared/interfaces/Spot'
import { UPDATE_SPOTS } from '../store/constants'

export default Vue.extend({
  name: 'Spot',

  components: {
    SpotForm
  },

  computed: {
    spots (): Spot[] {
      return this.$store.state.user.spots
    }
  },

  data () {
    return {
      submitting: false
    }
  },

  methods: {
    async updateSpots (spots: Spot[]) {
      const parsedSpots: Spot[] = spots.map(spot => {
        return Object.assign(spot, {
          name: helper.formatSpotName(spot.id)
        })
      })
      this.submitting = true

      try {
        await this.$store.dispatch(UPDATE_SPOTS, parsedSpots)

        snackbar.succes('Saved succesfully')
        this.submitting = false
      } catch (err) {
        snackbar.error()
        this.submitting = false
      }
    }
  }
})
</script>
