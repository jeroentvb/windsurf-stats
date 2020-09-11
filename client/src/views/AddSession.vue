<template>
  <v-container>
    <SessionForm
      v-model="sessionFormState"
      @submitSession="submit"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Api from '../services/api'
import helper from '../services/helper'
import snackbar from '../services/snackbar'

import SessionForm from '@/components/ui/form/SessionForm.vue'

import { Sail, Board } from '../../../shared/interfaces/Gear'
import { Spot } from '../../../shared/interfaces/Spot'
import { Session, Conditions } from '../../../shared/interfaces/Session'

import { ADD_SESSION } from '../store/constants'

export default Vue.extend({
  name: 'AddSession',

  components: {
    SessionForm
  },

  data () {
    return {
      sessionFormState: {
        submitting: false,
        formErrorMsg: ''
      }
    }
  },

  methods: {
    async submit (session: Session) {
      this.submittingForm(true)

      try {
        const res = await Api.post('session', session)

        if (res.status === 200) {
          this.$store.dispatch(ADD_SESSION, session)

          this.submittingForm(false)
        }
      } catch (err) {
        this.submittingForm(false)

        if (err.response.status === 422) {
          this.sessionFormState.formErrorMsg = 'Please fill in the required fields'
          return
        }

        snackbar.error()
      }
    },

    submittingForm (bool: boolean) {
      this.sessionFormState.submitting = bool
    }
  }
})
</script>
