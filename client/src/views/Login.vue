<template>
  <v-layout
    align-center
    justify-center>
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
              <!-- prepend-icon="person" -->
            </v-text-field>

            <v-text-field
              v-model="user.password"
              label="Password"
              name="password"
              type="password"
              required>
              <!-- prepend-icon="lock" -->
            </v-text-field>
          </v-form>

          <FormError
            v-if="formError"
            :msg="formErrorMsg"
          />
        </v-card-text>

        <v-card-actions>
          <v-btn
          color="primary"
          class="mb-2"
          large
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

import FormError from '../components/FormError.vue'

import { USER_LOGIN } from '../store/constants'

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

        if (res.status === 200) {
          this.$store.dispatch(USER_LOGIN)
        }
      } catch (err) {
        const status = err.response.status

        if (status === 422 || status === 401) {
          this.setError('Invalid credentials')
        }

        if (status === 500) {
          window.alert('Something went wrong. Try again later.')
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

<style lang="scss" scoped>
.v-btn {
  width: 100%;
}
</style>
