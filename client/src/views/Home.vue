<template>
  <div class="home">
    <h1>Sessions</h1>
    <p>{{ sessions }}</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Axios from 'axios'

import { Session } from '../interfaces/session'

export default Vue.extend({
  name: 'home',

  data () {
    return {
      sessions: []
    }
  },

  created () {
    // this.getData()
  },

  methods: {
    async getData () {
      const res = await Axios.get('http://localhost:25561/sessions', {
        withCredentials: true
      })

      this.sessions = res.data
    }
  }
})
</script>
