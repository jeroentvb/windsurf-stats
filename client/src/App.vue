<template>
  <v-app>
    <v-navigation-drawer
      v-if="loggedIn"
      v-model="drawer"
      app>
      <v-list>
        <v-list-item-group color="primary">

            <!-- <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon> -->

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Test</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title @click="logout()">Log out</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      v-if="loggedIn"
      app
      dark
      color="blue">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ routeName }}</v-toolbar-title>
    </v-app-bar>

    <!-- Router -->
    <v-content>
      <v-container fluid fill-height>
        <router-view />
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Axios from 'axios'
import { USER_LOGIN, USER_LOGOUT } from './store/constants'

export default Vue.extend({
  name: 'App',

  data () {
    return {
      drawer: ''
    }
  },

  computed: {
    routeName () {
      return this.$route.name
    },

    loggedIn () {
      return this.$store.state.loggedIn
    }
  },

  methods: {
    async logout () {
      try {
        const res = await Axios.post('http://localhost:25561/logout', {
          withCredentials: true
        })

        if (res.status === 200) {
          this.$store.dispatch(USER_LOGOUT)
        }
      } catch (err) {
        // TODO snackbar popup
      }
    }
  },

  async created () {
    try {
      const res = await Axios.get('http://localhost:25561', {
        withCredentials: true
      })

      if (res.status === 200) {
        await this.$store.dispatch(USER_LOGIN)
      }
    } catch (err) {
      // TODO: Show proper error message
      if (err.response.status === 401) {
        return console.error('Invalid credentials!')
      }
      console.error(err)
    }
  }
})
</script>
