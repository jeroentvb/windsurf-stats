<template>
  <div>
    <v-card>
      <v-card-title class="d-flex">
        <span class="flex-grow-1">{{ session.spot }} {{ date }}</span>
        <v-btn
          disabled
          class="mr-2"
          icon
          color="grey"
          @click="showEditSessionCard = true"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          color="grey"
          @click="closeModal"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <pre>{{ session }}</pre>
      </v-card-text>
    </v-card>

    <dialog-component v-model="showEditSessionCard">
      <EditSessionCard
        :initialSession="session"
        @close="showEditSessionCard = false"
      />
    </dialog-component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import DialogComponent from './DialogComponent.vue'
import EditSessionCard from './EditSessionCard.vue'

import { Session } from '../../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'SessionCard',

  components: {
    DialogComponent,
    EditSessionCard
  },

  props: {
    session: Object as () => Session
  },

  computed: {
    date () {
      return new Date(this.session.date).toLocaleDateString()
    }
  },

  data () {
    return {
      showEditSessionCard: false
    }
  },

  methods: {
    closeModal () {
      this.$emit('close')
    }
  }
})
</script>
