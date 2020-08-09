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

<script>
export default {
  name: 'ExportData',

  computed: {
    sessions () {
      return this.$store.state.user.sessions
    },

    username () {
      return this.$store.state.user.name
    },

    date () {
      return new Date().toLocaleDateString()
    }
  },

  methods: {
    exportCsv () {
      //
    },

    exportJson () {
      const blob = new Blob([ JSON.stringify(this.sessions, null, 2) ], { type: 'application/json' })
      this.download(blob)
    },

    download (blob) {
      const link = document.createElement('a')

      link.href = URL.createObjectURL(blob)
      link.download = `${this.username}-sessions-export_${this.date}`

      link.click()
      URL.revokeObjectURL(link.href)
      link.remove()
    }
  }
}
</script>
