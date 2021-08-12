<template>
  <v-layout
    align-center
    justify-center
    mt-8>
    <v-flex
      xs12
      sm8
      md4>
      <v-card>
        <v-card-title>
          Login
        </v-card-title>

        <v-card-text>
          <v-form
            @submit.prevent="submit"
            id="login-form">
            <v-text-field
              v-model="user.name"
              :rules="usernameRules"
              label="Username"
              name="username"
              type="text"
              required>
            </v-text-field>

            <v-text-field
              v-model="user.password"
              label="Password"
              name="password"
              type="password"
              required>
            </v-text-field>
          </v-form>

          <FormError
            v-if="formError"
            :msg="formErrorMsg"
          />

          <p v-if="allowRegister">
            Don't have an account? Register <router-link to="/register">here</router-link>
          </p>
        </v-card-text>

        <v-card-actions>
          <v-btn
          :loading="submitting"
          color="primary"
          class="mb-2"
          large
          block
          type="submit"
          form="login-form">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import snackbar from '../services/snackbar'

import FormError from '../components/ui/form/FormError.vue'

import { SET_USERDATA, USER_LOGIN } from '../store/constants'
import { User } from '../../../shared/interfaces/User'

export default Vue.extend({
  components: {
    FormError
  },

  data () {
    return {
      user: {
        name: '',
        password: ''
      },
      usernameRules: [
        (v: string) => !!v || 'Username is required'
      ],
      passwordRules: [
        (v: string) => !!v || 'Password is required'
      ],
      formError: false,
      formErrorMsg: '',
      allowRegister: process.env.VUE_APP_ALLOW_REGISTER === 'true',
      submitting: false
    }
  },

  methods: {
    submit () {
      if (!this.user.name || !this.user.password) {
        this.setError('Username or password missing!')
        return
      }

      this.submitting = true

      this.$store.dispatch(USER_LOGIN, this.user)
        .catch(err => {
          this.submitting = false
          if (err === 422 || err === 401) {
            this.setError('Invalid credentials')
          } else {
            snackbar.error()
          }
        })
    },

    setError (msg: string): void {
      this.formErrorMsg = msg
      this.formError = true
    }
  }
})
</script>
