<template>
  <v-card>
    <v-card-title>Edit session</v-card-title>

    <v-card-text>
      <pre>{{ session }}</pre>
      <AddSession />
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn
        color="grey"
        text
        @click="closeModal"
      >
        Cancel
      </v-btn>

      <v-btn
        color="secondary"
        text
        @click="show = false"
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

import AddSession from '../../views/AddSession.vue'

import { Session } from '../../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'SessionCard',

  components: {
    AddSession
  },

  props: {
    initialSession: Object as () => Session
  },

  data () {
    return {
      session: this.initialSession
    }
  },

  methods: {
    closeModal () {
      this.$emit('close')
    },

    updateSession () {
      console.log(this.session)
    }
  }
})
</script>
