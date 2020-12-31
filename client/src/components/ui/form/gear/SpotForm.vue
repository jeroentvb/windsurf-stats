<template>
  <v-card color="background" :min-height="minHeight" class="d-flex flex-column">
    <v-card-title>Spots</v-card-title>

    <v-card-text class="flex-grow-1">
      <v-form
        id="spot-form"
        @submit.prevent="submit"
        :disabled="submitting">
        <v-layout
          v-for="(spot, i) in spots"
          :key="spot.identifier"
          mb-4
          row>
          <v-flex xs12 px-4>
            <v-text-field
              v-model="spotForm[i].id"
              label="Spot identifier"
              required
              :rules="required"
              hint="This is the spotname as it appears in the windfinder url. For Maui Honolua Bay it would be: maui_honolua_bay."
            ></v-text-field>
          </v-flex>

          <v-flex xs11 px-4>
            <v-text-field
              v-model="spotForm[i].name"
              label="Spot name"
              required
              :rules="required"
              hint="This can be custom"
            ></v-text-field>
          </v-flex>

          <v-flex xs1 align-self-center>
            <v-btn icon color="grey"
            v-if="spotForm.length > 1"
            @click="deleteSpot(i)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
        text
        large
        @click="addSpot"
      >Add Spot</v-btn>
      <v-btn
        color="secondary"
        text
        large
        type="submit"
        form="spot-form"
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

import { Spot } from '../../../../../../shared/interfaces'

export default Vue.extend({
  name: 'SpotForm',

  props: {
    spots: Array as () => Spot[],
    minHeight: String,
    submitting: Boolean
  },

  data () {
    return {
      spotForm: this.spots,
      required: [
        (v: string) => !!v || 'All fields are required'
      ]
    }
  },

  created () {
    if (this.spots.length === 0) {
      this.addSpot()
    }
  },

  methods: {
    addSpot () {
      this.spotForm.push({
        id: '',
        name: '',
        windfinder: null
      })
    },

    deleteSpot (index: number) {
      this.spotForm.splice(index, 1)
    },

    submit () {
      // TODO:  State is not updated in this component for some weird reason...
      // v-model into this
      this.$emit('updateSpots', this.spotForm)
    }
  }
})
</script>
