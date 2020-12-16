<template>
  <v-card>
    <v-card-title>
      <span class="flex-grow-1">Edit session</span>
        <v-btn
          icon
          color="grey"
          @click="closeModal"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
    </v-card-title>

    <v-card-text>
      <SessionForm
        v-model="sessionFormState"
        :sessionData="initialSession"
        @submitSession="updateSession"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

import SessionForm from '@/components/ui/form/session/SessionForm.vue'

import { Session } from '../../../../shared/interfaces'

export default Vue.extend({
  name: 'SessionCard',

  components: {
    SessionForm
  },

  props: {
    initialSession: Object as () => Session
  },

  data () {
    return {
      session: this.initialSession,
      sessionFormState: {
        submitting: false,
        formErrorMsg: ''
      }
    }
  },

  methods: {
    closeModal () {
      this.$emit('close')
    },

    updateSession (session: Session) {
      this.sessionFormState.submitting = true
      this.$emit('updateSession', session)
    }
  }
})
</script>
