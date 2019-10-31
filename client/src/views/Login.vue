<template>
  <v-layout
    align-center
    justify-center
    class="mt-n12">
    <v-flex
      xs12
      sm8
      md4>
      <v-card outlined>
        <v-card-title>
          Login
        </v-card-title>

        <v-card-text>
          <v-form
            @submit.prevent="submit"
            id="login-form">
            <v-text-field
              v-model="user.username"
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
import Axios from 'axios'
import { USER_LOGIN } from '../store/constants'

export default Vue.extend({
  name: 'Login',

  data () {
    return {
      user: {
        username: '',
        password: ''
      },
      usernameRules: [
        (v: string) => !!v || 'Username is required'
      ],
      passwordRules: [
        (v: string) => !!v || 'Password is required'
      ]
    }
  },

  methods: {
    async submit () {
      if (!this.user.username || !this.user.password) {
        // TODO: Show proper error message
        console.error('Username or password missing!')
        return
      }

      try {
        const res = await Axios.post('http://localhost:25561/login', this.user, {
          withCredentials: true
        })

        if (res.status === 200) {
          this.$store.dispatch(USER_LOGIN)
        }
      } catch (err) {
        // TODO: Show proper error message
        if (err.response.status === 401) {
          return console.error('Invalid credentials!')
        }
        console.error(err)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.v-btn {
  width: 100%;
}
</style>
