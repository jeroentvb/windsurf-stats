<template>
  <div>
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
      :items="data"
      :search="search"
      item-key="index"
      :single-expand="true"
      :expanded.sync="expanded"
      :items-per-page="data.length"
      mobile-breakpoint="1000"
      show-expand
    >
      <template v-slot:expanded-item="{ headers, item }" class="note">
        <div :colspan="headers.length" class="pa-4">
          <h5>Note</h5>
          <p>{{ item.note }}</p>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { DataTableHeader } from '../../interfaces'

export default Vue.extend({
  name: 'DataTableComponent',

  props: {
    data: Array,
    headers: Array as () => DataTableHeader[]
  },

  data () {
    return {
      search: '',
      expanded: []
    }
  },

  methods: {
    editItem (item: any) {
      this.$emit('editItem', item)
    }
  }
})
</script>
