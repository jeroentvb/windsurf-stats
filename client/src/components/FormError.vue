<template>
  <v-alert
      border="right"
      colored-border
      type="error"
      elevation="2"
    >
      {{ msg }}
    </v-alert>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'FormError',

  props: {
    msg: String
  }
})
</script>

<style lang="scss" scoped>

</style>
