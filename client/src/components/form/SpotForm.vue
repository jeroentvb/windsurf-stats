<template>
  <v-card color="background" :min-height="minHeight" class="d-flex flex-column">
    <v-card-title>Spots</v-card-title>

    <v-card-text class="flex-grow-1">
      <v-form
        id="spot-form"
        @submit.prevent="submit">
        <v-layout
          v-for="(spot, i) in spots"
          :key="spot.identifier"
          row>

          <v-flex md11 px-4>
            <v-text-field
              v-model="spotForm[i].id"
              label="Spot identifier"
              required
              :rules="required"
              hint="This is the spotname as it appears in the windfinder url. For Maui Honolua Bay it would be: maui_honolua_bay."
            ></v-text-field>
          </v-flex>

          <v-flex md1 align-self-center>
            <v-btn icon color="grey"
            v-if="i !== 0"
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
        @click="addSpot()"
      >Add Spot</v-btn>
      <v-btn
        color="secondary"
        text
        large
        type="submit"
        form="spot-form"
      >Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

import { Spot } from '../../../../shared/interfaces/Spot'

export default Vue.extend({
  name: 'SpotForm',

  props: {
    spots: Array as () => Spot[],
    minHeight: String
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
      this.$emit('updateSpots', this.spotForm)
    }
  }
})
</script>
