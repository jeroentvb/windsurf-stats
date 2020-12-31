<template>
  <v-card color="background" :min-height="minHeight" class="d-flex flex-column">
    <v-card-title>Account e-mail address</v-card-title>

    <v-card-text class="flex-grow-1">
      <v-form
        id="email-form"
        @submit.prevent="submit"
        :disabled="submitting">
        <v-layout row>
          <v-flex md11 px-4>
            <p>Your current e-mail address is: {{ oldEmail }}</p>

            <v-text-field
              v-model="email"
              label="New e-mail address"
              required
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Password"
              required
              type="password"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
        :disabled="!email || !password"
        color="secondary"
        text
        large
        type="submit"
        form="email-form"
      >Save</v-btn>
    </v-card-actions>

    <v-progress-linear
      v-if="submitting"
      indeterminate
      color="primary"
    ></v-progress-linear>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import snackbar from '../../../../services/snackbar'

export default Vue.extend({
  name: 'EmailForm',

  props: {
    oldEmail: String,
    submitting: Boolean,
    minHeight: String
  },

  data () {
    return {
      email: '',
      password: ''
    }
  },

  watch: {
    oldEmail () {
      this.email = ''
      this.password = ''
    }
  },

  methods: {
    submit () {
      this.$emit('updateEmail', {
        email: this.email,
        password: this.password
      })
    }
  }
})
</script>
