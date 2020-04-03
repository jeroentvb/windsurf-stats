<template>
  <v-layout
    align-center
    justify-center>
    <v-flex
      xs12
      sm8
      md4>
      <v-card outlined>
        <v-card-title>
          Register
        </v-card-title>

        <v-card-text>
          <v-form
            @submit.prevent="submit"
            id="register-form">
            <v-text-field
              v-model="user.username"
              label="Username"
              name="username"
              type="text"
              required>
              <!-- :rules="usernameRules" -->
              <!-- prepend-icon="person" -->
            </v-text-field>

            <v-text-field
              v-model="user.email"
              :rules="emailRules"
              label="E-mail address"
              name="email"
              type="email"
              required>
              <!-- prepend-icon="lock" -->
            </v-text-field>

            <v-text-field
              v-model="user.password"
              :rules="passwordRules"
              label="Password"
              name="password"
              type="password"
              required>
              <!-- prepend-icon="lock" -->
            </v-text-field>

            <v-text-field
              v-model="user.repeatPassword"
              :rules="passwordRules"
              label="Repeat password"
              name="repeat-password"
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
          form="register-form">Register</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import Api from '../services/api'

import FormError from '../components/FormError.vue'

import { USER_REGISTER } from '../store/constants'

export default Vue.extend({
  name: 'Register',

  components: {
    FormError
  },

  data () {
    return {
      user: {
        username: '',
        email: '',
        password: '',
        repeatPassword: ''
      },
      formError: false,
      formErrorMsg: '',
      usernameRules: [
        (v: string) => !!v || 'Username is required'
      ],
      emailRules: [
        (v: string) => !!v || 'E-mail is required'
      ],
      passwordRules: [
        (v: string) => !!v || 'Password is required'
      ]
    }
  },

  methods: {
    async submit () {
      const user = this.user
      const formError = this.validateForm()

      if (formError) {
        this.setError(formError)
        return
      }

      try {
        const res = await Api.post('register', {
          name: user.username,
          email: user.email,
          password: user.password
        })

        if (res.status === 200) {
          await this.$store.dispatch(USER_REGISTER)
        }
      } catch (err) {
        const status = err.response.status

        if (status === 409) {
          this.setError('E-mail or username is already used')
        }
        if (status === 422) {
          this.setError('Field missing')
        }
        if (status === 500) {
          window.alert('Something went wrong. Try again later.')
        }
      }
    },

    validateForm (): string | void {
      const user = this.user

      if (!user.username || !user.email || !user.password || !user.repeatPassword) {
        return 'Field missing'
      }

      if (user.password !== user.repeatPassword) {
        return 'Passwords don\'t match'
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

</style>
