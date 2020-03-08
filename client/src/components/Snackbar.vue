<template>
  <v-snackbar
      v-model="show"
      :bottom="true"
      :timeout="timeout"
    >
      {{ text }}
      <v-btn
        dark
        text
        @click="show = false"
      >
        Close
      </v-btn>
    </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Snackbar',

  props: {
    text: String,
    timeout: Number,
    show: Boolean
  }
})
</script>
