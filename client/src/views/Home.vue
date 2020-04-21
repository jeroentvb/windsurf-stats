<template>
  <div class="home">
    <h1>Sessions</h1>
    <pre>{{ sessions }}</pre>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Axios from 'axios'
import Api from '../services/api'

import { SHOW_SNACKBAR } from '../store/constants'
import { Snackbar } from '../interfaces'

export default Vue.extend({
  name: 'home',

  data () {
    return {
      sessions: []
    }
  },

  created () {
    this.getData()
  },

  methods: {
    async getData () {
      try {
        const res = await Api.get('sessions')

        this.sessions = res.data
      } catch (err) {
        this.$store.commit(SHOW_SNACKBAR, {
          text: 'Something went wrong!',
          timeout: 5000,
          type: 'error'
        } as Snackbar)
      }
    }
  }
})
</script>
