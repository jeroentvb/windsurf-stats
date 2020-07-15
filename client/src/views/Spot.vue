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
import Api from '../services/api'

import SpotForm from '../components/form/SpotForm.vue'

import helper from '../services/helper'

import { Spot } from '../../../shared/interfaces/Spot'
import { UPDATE_SPOTS, SHOW_SNACKBAR } from '../store/constants'
import { Snackbar } from '../interfaces'

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
        const res = await Api.post('spots', parsedSpots)

        if (res.status === 200) {
          this.$store.commit(UPDATE_SPOTS, res.data)
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
