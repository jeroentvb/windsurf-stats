<template>
  <v-card color="background" :min-height="minHeight" class="d-flex flex-column">
    <v-card-title>Sails</v-card-title>

    <v-card-text class="flex-grow-1">
      <v-form
        id="sail-form"
        @submit.prevent="submit"
        :disabled="submitting">
        <v-layout
          v-for="(sail, i) in sails"
          :key="sail.id"
          row
          class="gear-item">
          <v-flex xs12 sm4 px-4>
            <v-combobox
              v-model="sailsForm[i].brand"
              :items="brands"
              label="Brand"
              single
              required
              :rules="required"
            ></v-combobox>
          </v-flex>

          <v-flex xs12 sm4 px-4>
            <v-combobox
              v-model="sailsForm[i].model"
              :items="models"
              label="Model"
              single
              required
              :rules="required"
            ></v-combobox>
          </v-flex>

          <v-flex xs10 sm3 px-4>
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

          <v-flex xs2 sm1 align-self-center>
            <v-btn icon color="grey"
            v-if="i !== 0"
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

    <v-progress-linear
      v-if="submitting"
      indeterminate
      color="primary"
    ></v-progress-linear>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

import { Sail } from '../../../../shared/interfaces/Gear'

export default Vue.extend({
  name: 'SailForm',

  props: {
    sails: Array as () => Sail[],
    minHeight: String,
    submitting: Boolean
  },

  data () {
    return {
      sailsForm: this.sails,
      required: [
        (v: string) => !!v || 'All fields are required'
      ]
    }
  },

  computed: {
    // Put this function in a helper, it's also used in the boardForm

    brands (): string[] {
      const items = this.sails.map((sailItem: Sail) => sailItem.brand)
      return items.filter((sailItem, i) => sailItem && items.indexOf(sailItem) === i)
    },

    models (): string[] {
      const items = this.sails.map((sailItem: Sail) => sailItem.model)
      return items.filter((sailItem, i) => sailItem && items.indexOf(sailItem) === i)
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
