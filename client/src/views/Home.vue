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
      sessions: [],
      testData: [{ x: '2016-12-25', y: 20 }, { x: '2016-12-26', y: 10 }]
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
