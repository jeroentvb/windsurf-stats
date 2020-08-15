<template>
  <v-container fluid>
    <v-card-title>
      All statistics
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="sessions"
      :search="search"
      item-key="index"
      :single-expand="true"
      :expanded.sync="expanded"
      :items-per-page="sessions.length"
      mobile-breakpoint="1000"
      show-expand
    >
      <template v-slot:expanded-item="{ headers, item }" class="note">
        <div :colspan="headers.length" class="pa-4">
          <h5>Note</h5>
          <p>{{ item.note }}</p>
        </div>
      </template>
    </v-data-table>

    <ExportData />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

import ExportData from '../components/ExportData.vue'

import { Session } from '../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'AllStatistics',

  components: {
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
      search: '',
      expanded: [],
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
