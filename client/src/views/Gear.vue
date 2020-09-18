<template>
  <v-container>
    <v-layout column>
      <v-layout row wrap>
        <v-flex md6 pa-4>
          <SailForm
          :sails="gear.sails"
          @updateSails="submittingSails = true; updateGear()"
          :submitting="submittingSails" />
        </v-flex>

        <v-flex md6 pa-4>
          <BoardForm
          :boards="gear.boards"
          @updateBoards="submittingBoards = true; updateGear()"
          :submitting="submittingBoards" />
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import snackbar from '../services/snackbar'

import SailForm from '../components/ui/form/SailForm.vue'
import BoardForm from '../components/ui/form/BoardForm.vue'

import { Gear, Sail, Board } from '../../../shared/interfaces/Gear'
import { UPDATE_GEAR, SHOW_SNACKBAR } from '../store/constants'
import { Snackbar } from '../interfaces'

export default Vue.extend({
  components: {
    SailForm,
    BoardForm
  },

  computed: {
    newAccount (): boolean {
      return this.$store.state.newAccount
    },

    gear (): Gear {
      return this.$store.state.user.gear
    }
  },

  data () {
    return {
      submittingSails: false,
      submittingBoards: false
    }
  },

  methods: {
    async updateGear (sails: Sail[] | null, boards: Board[] | null): Promise<void> {
      const gear: Gear = {
        sails: sails || this.gear.sails,
        boards: boards || this.gear.boards
      }

      try {
        await this.$store.dispatch(UPDATE_GEAR, gear)

        snackbar.succes('Saved succesfully!')
        this.stopSubmitting()
      } catch (err) {
        snackbar.error()

        this.stopSubmitting()
      }
    },

    stopSubmitting () {
      this.submittingSails = false
      this.submittingBoards = false
    }
  }
})
</script>

<style lang="scss">
.gear-item {
  @media (max-width: 599px) {
    margin-bottom: 2em;
  }
}
</style>
