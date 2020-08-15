<template>
  <v-container fluid>
    <DataTableComponent
      :data="sessions"
      :headers="headers"
    />

    <ExportData />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

import DataTableComponent from '../components/ui/DataTableComponent.vue'
import ExportData from '../components/feature/ExportData.vue'

import { Session } from '../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'AllStatistics',

  components: {
    DataTableComponent,
    ExportData
  },

  computed: {
    sessions () {
      return JSON.parse(JSON.stringify(this.$store.state.user.sessions))
        .map((session: Session, i: number) => {
          const newSession: any = session
          newSession.date = new Date(session.date).toLocaleDateString()
          newSession.index = i
          return newSession
        })
    }
  },

  data () {
    return {
      headers: [
        {
          text: 'Date',
          align: 'start',
          sortable: false,
          value: 'date'
        },
        { text: 'Rating', value: 'rating' },
        { text: 'Spot', value: 'spot' },
        { text: 'Sail', value: 'gear.sail' },
        { text: 'Board', value: 'gear.board' },
        { text: 'Windspeed (knots)', value: 'conditions.windspeed' },
        { text: 'Windgust (knots)', value: 'conditions.windgust' },
        { text: 'Winddirection (degrees)', value: 'conditions.winddirection' },
        { text: 'Temperature (degrees)', value: 'conditions.temperature' },
        { text: 'Temperature', value: 'conditions.windgust' },
        { text: '', value: 'data-table-expand' }
      ]
    }
  }
})
</script>
