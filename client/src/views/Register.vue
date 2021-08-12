<template>
  <v-layout
    align-center
    justify-center
    mt-8>
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
              v-model="user.name"
              label="Username"
              name="username"
              type="text"
              required>
            </v-text-field>

            <v-text-field
              v-model="user.email"
              :rules="emailRules"
              label="E-mail address"
              name="email"
              type="email"
              required>
            </v-text-field>

            <v-text-field
              v-model="user.password"
              :rules="passwordRules"
              label="Password"
              name="password"
              type="password"
              required>
            </v-text-field>

            <v-text-field
              v-model="user.repeatPassword"
              :rules="passwordRules"
              label="Repeat password"
              name="repeat-password"
              type="password"
              required>
            </v-text-field>
          </v-form>

          <FormError
            v-if="!!formErrorMsg"
            :msg="formErrorMsg"
          />

          <p>
            Already have an account? Login <router-link to="/login">here</router-link>
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
          form="register-form">Register</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import snackbar from '../services/snackbar'

import FormError from '../components/ui/form/FormError.vue'

import { USER_REGISTER } from '../store/constants'
import { User } from '../../../shared/interfaces/User'

type registerUser = {
  name: string
  email: string
  password: string
  repeatPassword: string
}

export default Vue.extend({
  name: 'Register',

  components: {
    FormError
  },

  data () {
    return {
      user: {
        name: '',
        email: '',
        password: '',
        repeatPassword: ''
      } as registerUser,
      formErrorMsg: '',
      submitting: false,
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
    submit () {
      const user: registerUser = this.user
      const formError: string | void = this.validateForm(user)

      if (formError) {
        this.setError(formError)
        return
      }

      this.submitting = true

      this.$store.dispatch(USER_REGISTER, user)
        .catch((err: Error) => {
          this.submitting = false
          this.setError(err.message)
        })
    },

    validateForm (user: registerUser): string | void {
      if (!user.name || !user.email || !user.password || !user.repeatPassword) {
        return 'Field missing'
      }

      if (user.password !== user.repeatPassword) {
        return 'Passwords don\'t match'
      }
    },

    setError (msg: string): void {
      this.formErrorMsg = msg
    }
  }
})
</script>
