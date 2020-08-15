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

          <p>
            Don't have an account? Register <router-link to="/register">here</router-link>
          </p>
        </v-card-text>

        <v-card-actions>
          <v-btn
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
import Api from '../services/api'

import FormError from '../components/ui/FormError.vue'

import { USER_LOGIN, SET_USERDATA, SHOW_SNACKBAR } from '../store/constants'
import { Snackbar } from '../interfaces'
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
      formErrorMsg: ''
    }
  },

  methods: {
    async submit () {
      if (!this.user.name || !this.user.password) {
        this.setError('Username or password missing!')
        return
      }

      try {
        const res = await Api.post('login', this.user)
        const response = await Api.get('user')

        if (res.status === 200 && response.status === 200) {
          this.$store.dispatch(SET_USERDATA, response.data as User)
        }
      } catch (err) {
        const status = err.response ? err.response.status : err.message

        if (status === 422 || status === 401) {
          this.setError('Invalid credentials')
        } else {
          this.$store.commit(SHOW_SNACKBAR, {
            text: 'Something went wrong!',
            timeout: 5000,
            type: 'error'
          } as Snackbar)
        }
      }
    },

    setError (msg: string): void {
      this.formErrorMsg = msg
      this.formError = true
    }
  }
})
</script>
