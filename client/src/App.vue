<template>
  <v-app>
    <v-overlay
      :value="loading"
      :opacity="1"
      :z-index="10"
    >
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <!-- Navigation -->
    <v-navigation-drawer
      v-if="loggedIn"
      v-model="drawer"
      app>
      <v-list>
        <v-list-item-group color="primary">
          <div v-for="route in routes" :key="route.name">
            <v-list-item  v-if="!route.meta" :to="route.path">
              <v-list-item-content >
                <v-list-item-title>{{ route.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title @click="logout()">Log out</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <!-- App/top bar -->
    <v-app-bar
      v-if="loggedIn"
      app
      dark
      color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ routeName }}</v-toolbar-title>
    </v-app-bar>

    <!-- App outlet -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :bottom="true"
      :timeout="snackbar.timeout"
      :color="snackbar.type"
    >
    <div class="d-flex align-center">
      {{ snackbar.text }}
      <v-btn
        dark
        text
        @click="closeSnackbar"
        class="ml-auto"
      >
        Close
      </v-btn>
    </div>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import api from './services/api'
import snackbar from './services/snackbar'

import { USER_LOGIN, USER_LOGOUT, SET_USERDATA, STOP_LOADING } from './store/constants'
import { routes } from './router/index'

import { User } from '../../shared/interfaces'

export default Vue.extend({
  name: 'App',

  data () {
    return {
      drawer: '',
      routes
    }
  },

  computed: {
    routeName () {
      return this.$route.name
    },

    loggedIn () {
      return this.$store.state.loggedIn
    },

    loading () {
      return this.$store.state.loading
    },

    snackbar () {
      return this.$store.state.snackbar
    }
  },

  methods: {
    async logout () {
      try {
        const res = await api.post('logout', {})

        if (res.status === 200) {
          this.$store.dispatch(USER_LOGOUT)
        }
      } catch (err) {
        snackbar.error()
      }
    },

    closeSnackbar () {
      snackbar.close()
    }
  },

  async created () {
    try {
      const res = await api.get<User>('user')

      if (res.status === 200) {
        await this.$store.dispatch(SET_USERDATA, res.data)
      }
    } catch (err) {
      if (this.$route.path !== '/login') this.$router.push('/login')
      this.$store.commit(STOP_LOADING)
    }
  }
})
</script>

<style lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type=number] {
    -moz-appearance:textfield;
}
</style>
