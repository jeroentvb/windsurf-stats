<template>
  <div class="home">
    <h1>Sessions</h1>
    <pre>{{ sessions }}</pre>
    <BarChart :data="testData" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Axios from 'axios'
import Api from '../services/api'

import BarChart from '../components/BarChart.vue'

import { SHOW_SNACKBAR } from '../store/constants'
import { Snackbar } from '../interfaces'

export default Vue.extend({
  name: 'home',
  components: {
    BarChart
  },

  data () {
    return {
      testData: [{ x: '2016-12-25', y: 20 }, { x: '2016-12-26', y: 10 }]
    }
  },

  computed: {
    sessions () {
      return this.$store.state.user.sessions

    }
  }
})
</script>
