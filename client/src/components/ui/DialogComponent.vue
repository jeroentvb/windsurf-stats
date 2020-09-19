<template>
  <v-dialog
    v-model="show"
    max-width="75%"
  >
    <slot></slot>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'DialogComponent',

  props: {
    value: Boolean
  },

  computed: {
    show: {
      get (): boolean {
        return this.value
      },
      set (value: boolean): void {
        this.$emit('input', value)
      }
    }
  }
})
</script>
