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

  computed: {
    sessions () {
      return this.$store.state.user.sessions
    }
  }
})
</script>
