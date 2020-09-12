<template>
  <div>
    <v-card>
      <v-card-title class="d-flex">
        <span class="flex-grow-1">{{ session.spot }} {{ date }}</span>
        <v-btn
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
        @updateSession="updateSession"
        @close="showEditSessionCard = false"
      />
    </dialog-component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import snackbar from '../../services/snackbar'

import DialogComponent from './DialogComponent.vue'
import EditSessionCard from './EditSessionCard.vue'

import { Session } from '../../../../shared/interfaces/Session'
import { UPDATE_SESSION } from '../../store/constants'

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
    async updateSession (session: Session) {
      try {
        await this.$store.dispatch(UPDATE_SESSION, session)

        snackbar.succes('Session updated succesfully!')
        this.showEditSessionCard = false
        this.selectedSession = {}
      } catch (err) {
        snackbar.error()
      }
    },

    closeModal () {
      this.$emit('close')
    }
  }
})
</script>
