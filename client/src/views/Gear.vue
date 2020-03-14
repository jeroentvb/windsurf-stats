<template>
  <v-container>
    <v-layout column>
      <v-layout row wrap>
        <v-flex md6 pa-4>
          <SailForm
          :sails="gear.sails"
          @updateSails="updateGear"/>
        </v-flex>

        <v-flex md6 pa-4>
          <BoardForm
          :boards="gear.boards"
          @updateBoards="updateGear" />
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Axios from 'axios'

import SailForm from '../components/form/SailForm.vue'
import BoardForm from '../components/form/BoardForm.vue'

import { Gear, Sail, Board } from '../../../shared/interfaces/Gear'
import { UPDATE_GEAR, SHOW_SNACKBAR } from '../store/constants'

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

  methods: {
    async updateGear (sails: Sail[] | null, boards: Board[] | null) {
      const gear: Gear = {
        sails: sails || this.gear.sails,
        boards: boards || this.gear.boards
      }

      try {
        const res = await Axios.post(`${process.env.VUE_APP_API_URL}/gear`, gear, {
          withCredentials: true
        })

        if (res.status === 200) {
          this.$store.commit(UPDATE_GEAR, gear)
          this.$store.commit(SHOW_SNACKBAR, {
            text: 'Saved succesfully'
          })
          // this.showSnackbar = true
        }
      } catch (err) {
        // Show snackbar error!
        console.error(err)
      }
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
