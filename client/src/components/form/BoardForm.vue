<template>
  <v-card color="background">
    <v-card-title>Boards</v-card-title>

    <v-card-text>
      <v-form
        id="board-form"
        @submit.prevent="submit">
        <v-layout
          v-for="(board, i) in boards"
          :key="board.id"
          row>
          <v-flex md4 px-4>
            <v-text-field
              label="Brand"
              v-model="boardsForm[i].brand"
              required
              :rules="required"
            ></v-text-field>
          </v-flex>

          <v-flex md4 px-4>
            <v-text-field
              label="Model"
              v-model="boardsForm[i].model"
              required
              :rules="required"
            ></v-text-field>
          </v-flex>

          <v-flex md3 px-4>
            <v-text-field
              label="Volume"
              type="number"
              v-model="boardsForm[i].volume"
              min="1"
              step="0.1"
              required
              :rules="required"
            ></v-text-field>
          </v-flex>

          <v-flex md-1 align-self-center
          v-if="i !== 0">
            <v-btn icon color="grey"
            @click="deleteBoard(i)">
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
        @click="addBoard()"
      >Add board</v-btn>
      <v-btn
        color="secondary"
        text
        large
        type="submit"
        form="board-form"
      >Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'

import { Board } from '../../../../shared/interfaces/Gear'

export default Vue.extend({
  name: 'BoardForm',

  props: {
    boards: Array as () => Board[],
    minHeight: String
  },

  data () {
    return {
      boardsForm: this.boards,
      required: [
        (v: string) => !!v || 'All fields are required'
      ]
    }
  },

  created () {
    if (this.boards.length === 0) {
      this.addBoard()
    }
  },

  methods: {
    addBoard () {
      this.boardsForm.push({
        brand: '',
        model: '',
        volume: ''
      })
    },

    deleteBoard (index: number) {
      this.boardsForm.splice(index, 1)
    },

    submit () {
      this.$emit('updateBoards', null, this.boardsForm)
    }
  }
})
</script>
