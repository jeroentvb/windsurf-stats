<template>
  <v-container>
    <v-layout column>
      <v-layout row wrap>
        <v-flex md6 pa-4>
          <SailForm
          :sails="sails"
          @updateSails="submittingSails = true; updateGear()"
          :submitting="submittingSails" />
        </v-flex>

        <v-flex md6 pa-4>
          <BoardForm
          :boards="boards"
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

import SailForm from '../components/ui/form/gear/SailForm.vue'
import BoardForm from '../components/ui/form/gear/BoardForm.vue'

import { Gear, Sail, Board } from '../../../shared/interfaces'
import { UPDATE_GEAR, SHOW_SNACKBAR } from '../store/constants'
import { Snackbar } from '../interfaces'

export default Vue.extend({
  components: {
    SailForm,
    BoardForm
  },

  computed: {
    sails (): Sail[] {
      return this.$store.state.user.gear.sails.slice()
    },

    boards (): Board[] {
      return this.$store.state.user.gear.boards.slice()
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
        sails: sails || this.sails,
        boards: boards || this.boards
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
