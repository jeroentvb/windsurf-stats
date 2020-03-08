<template>
  <v-card color="background" :min-height="minHeight" class="d-flex flex-column">
    <v-card-title>Sails</v-card-title>

    <v-card-text class="flex-grow-1">
      <v-form
        id="sail-form"
        @submit.prevent="submit">
        <v-layout
          v-for="(sail, i) in sails"
          :key="sail.id"
          row>
          <v-flex md4 px-4>
            <v-text-field
              label="Brand"
              v-model="sailsForm[i].brand"
              required
              :rules="required"
            ></v-text-field>
          </v-flex>

          <v-flex md4 px-4>
            <v-text-field
              label="Model"
              v-model="sailsForm[i].model"
              required
              :rules="required"
            ></v-text-field>
          </v-flex>

          <v-flex md3 px-4>
            <v-text-field
              label="Size"
              type="number"
              v-model="sailsForm[i].size"
              min="1"
              step="0.1"
              required
              :rules="required"
            ></v-text-field>
          </v-flex>

          <v-flex md-1 align-self-center
          v-if="i !== 0">
            <v-btn icon color="grey"
            @click="deleteSail(i)">
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
        @click="addSail()"
      >Add sail</v-btn>
      <v-btn
        color="secondary"
        text
        large
        type="submit"
        form="sail-form"
      >Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

import { Sail } from '../../../../shared/interfaces/Gear'

export default Vue.extend({
  name: 'SailForm',

  props: {
    sails: Array as () => Sail[],
    minHeight: String
  },

  data () {
    return {
      sailsForm: this.sails,
      required: [
        (v: string) => !!v || 'All fields are required'
      ]
    }
  },

  created () {
    if (this.sails.length === 0) {
      this.addSail()
    }
  },

  methods: {
    addSail () {
      this.sailsForm.push({
        brand: '',
        model: '',
        size: ''
      })
    },

    deleteSail (index: number) {
      this.sailsForm.splice(index, 1)
    },

    submit () {
      this.$emit('updateSails', this.sailsForm)
    }
  }
})
</script>
