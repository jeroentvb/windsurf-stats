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

            <!-- <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon> -->
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
      {{ snackbar.text }}
      <v-btn
        dark
        text
        @click="closeSnackbar"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Api from './services/api'

import { USER_LOGIN, USER_LOGOUT, SET_USERDATA, STOP_LOADING, CLOSE_SNACKBAR, SHOW_SNACKBAR } from './store/constants'
import { routes } from './router/index'

import { User } from '../../shared/interfaces/User'
import { Snackbar } from './interfaces'

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
        const res = await Api.post('logout', {})

        if (res.status === 200) {
          this.$store.dispatch(USER_LOGOUT)
        }
      } catch (err) {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Something went wrong!',
          timeout: 5000,
          type: 'error'
        } as Snackbar)
      }
    },

    closeSnackbar () {
      this.$store.commit(CLOSE_SNACKBAR)
    }
  },

  async created () {
    try {
      const res = await Api.get('user')

      if (res.status === 200) {
        await this.$store.dispatch(SET_USERDATA, res.data as User)
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
