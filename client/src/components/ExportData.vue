<template>
  <div>
    <v-btn
    color="primary"
    class="my-4 mr-4"
    medium
    @click="exportCsv">Export csv</v-btn>

    <v-btn
    color="primary"
    class="my-4"
    medium
    @click="exportJson">Export json</v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { Session } from '../../../shared/interfaces/Session'

import helper from '../services/helper'

export default Vue.extend({
  name: 'ExportData',

  computed: {
    sessions (): Session[] {
      return this.$store.state.user.sessions
    },

    username (): string {
      return this.$store.state.user.name
    },

    date (): string {
      return new Date().toLocaleDateString()
    }
  },

  methods: {
    exportCsv () {
      const csv = helper.createCsv(this.sessions, ';')
      const blob = new Blob([ csv ], { type: 'text/csv' })

      this.download(blob)
    },

    exportJson () {
      const blob = new Blob([ JSON.stringify(this.sessions, null, 2) ], { type: 'application/json' })

      this.download(blob)
    },

    download (blob: Blob) {
      const link = document.createElement('a')

      link.href = URL.createObjectURL(blob)
      link.download = `${this.username}-sessions-export_${this.date}`

      link.click()
      URL.revokeObjectURL(link.href)
      link.remove()
    }
  }
})
</script>
