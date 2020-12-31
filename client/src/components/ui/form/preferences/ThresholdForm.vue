<template>
  <v-card color="background" :min-height="minHeight" class="d-flex flex-column">
    <v-card-title>Threshold</v-card-title>

    <v-card-text class="flex-grow-1">
      <v-form
        id="threshold-form"
        @submit.prevent="submit"
        :disabled="submitting">
        <v-layout row>
          <v-flex md11 px-4>
            <p>Sessions rated with a number below this threshold won't be shown in the chart data.</p>

            <v-select
              v-model.number="threshold"
              :items="getNumberArray(1, 10, 1)"
              label="Session threshold"
              required
              :rules="required"
            ></v-select>
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
        color="secondary"
        text
        large
        type="submit"
        form="threshold-form"
      >Save</v-btn>
    </v-card-actions>

    <v-progress-linear
      v-if="submitting"
      indeterminate
      color="primary"
    ></v-progress-linear>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import helper from '@/services/helper'

export default Vue.extend({
  name: 'ThresholdForm',

  props: {
    oldThreshold: Number,
    minHeight: String,
    submitting: Boolean
  },

  computed: {
    getNumberArray () {
      return helper.getNumberArray
    }
  },

  data () {
    return {
      threshold: this.oldThreshold,
      required: [
        (v: string) => !!v || 'All fields are required'
      ]
    }
  },

  methods: {
    submit () {
      this.$emit('updateThreshold', this.threshold)
    }
  }
})
</script>
