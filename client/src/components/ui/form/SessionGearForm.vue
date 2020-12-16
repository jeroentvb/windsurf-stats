<template>
  <v-layout column>
    <v-select
      v-model="session.gear.sail"
      :items="sails"
      label="Sail"
      required
      :rules="required"
    ></v-select>

    <v-select
      v-model="session.gear.board"
      :items="boards"
      label="Board"
      required
      :rules="required"
    ></v-select>

    <v-select
      v-model.number="session.rating"
      label="Rating"
      :items="getNumberArray(1, 10, 1)"
      required
      :rules="required"
    ></v-select>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue'

import helper from '../../../services/helper'

import { Session } from '../../../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'SessionGearForm',

  props: {
    value: Object as () => Session,
    sails: Array as () => string[],
    boards: Array as () => string[]
  },

  computed: {
    session: {
      get (): Session {
        return this.value
      },
      set (value: Session): void {
        this.$emit('input', value)
      }
    },

    getNumberArray () {
      return helper.getNumberArray
    }
  },

  data () {
    return {
      required: [
        (v: string) => !!v || 'All fields are required'
      ]
    }
  }
})
</script>
