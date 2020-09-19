<template>
  <v-container fluid>
    <DataTableComponent
      :data="sessions"
      :headers="headers"
      @editItem="editSession"
    />

    <ExportData />

    <dialog-component v-model="showEditSessionCard">
      <EditSessionCard
        :initialSession="selectedSession"
        @close="showEditSessionCard = false, selectedSession = {}"
        @updateSession="updateSession"
      />
    </dialog-component>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

import DataTableComponent from '../components/ui/DataTableComponent.vue'
import ExportData from '../components/feature/ExportData.vue'
import DialogComponent from '@/components/ui/DialogComponent.vue'
import EditSessionCard from '@/components/ui/EditSessionCard.vue'

import { Session } from '../../../shared/interfaces/Session'
import { UPDATE_SESSION } from '../store/constants'
import snackbar from '../services/snackbar'

export default Vue.extend({
  name: 'AllStatistics',

  components: {
    DataTableComponent,
    ExportData,
    DialogComponent,
    EditSessionCard
  },

  computed: {
    sessions () {
      return JSON.parse(JSON.stringify(this.$store.state.user.sessions))
        .map((session: Session, i: number) => {
          return {
            ...session,
            displayDate: new Date(session.date).toLocaleDateString(),
            index: i
          }
        })
        .reverse()
    }
  },

  data () {
    return {
      headers: [
        {
          text: 'Date',
          align: 'start',
          sortable: false,
          value: 'displayDate'
        },
        { text: 'Rating', value: 'rating' },
        { text: 'Spot', value: 'spot' },
        { text: 'Sail', value: 'gear.sail' },
        { text: 'Board', value: 'gear.board' },
        { text: 'Windspeed (knots)', value: 'conditions.windspeed' },
        { text: 'Windgust (knots)', value: 'conditions.windgust' },
        { text: 'Winddirection (degrees)', value: 'conditions.winddirection' },
        { text: 'Temperature (degrees)', value: 'conditions.temperature' },
        { text: '', value: 'data-table-expand' },
        { text: '', value: 'actions' }
      ],
      showEditSessionCard: false,
      selectedSession: {} as Session
    }
  },

  methods: {
    editSession (session: Session) {
      this.selectedSession = session
      this.showEditSessionCard = true
    },

    async updateSession (session: Session) {
      try {
        await this.$store.dispatch(UPDATE_SESSION, session)

        snackbar.succes('Session updated succesfully!')
        this.showEditSessionCard = false
        this.selectedSession = {} as Session
      } catch (err) {
        snackbar.error()
      }
    }
  }
})
</script>
