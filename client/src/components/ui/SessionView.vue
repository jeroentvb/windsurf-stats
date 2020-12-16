<template>
  <v-form :readonly="true" id="session-view">
    <v-layout row wrap>
      <v-flex xs12 md6 pa-4>
        <v-card>
          <v-card-title>Session details</v-card-title>
          <v-card-text>
            <v-layout column>
              <h3 class="mt-4">When did you sail?</h3>
              <v-text-field
                v-model="date"
                label="Date"
              ></v-text-field>

              <v-select
                v-model.number="session.time.start"
                :items="[session.time.start]"
                label="Starting hour"
              ></v-select>

              <v-select
                v-model.number="session.time.end"
                :items="[session.time.end]"
                label="End hour"
              ></v-select>

              <h3 class="mt-4">Where did you sail?</h3>
              <v-select
                v-model="session.spot"
                :items="[session.spot]"
                label="Spot"
              ></v-select>

              <div class="mt-8">
                <v-text-field
                  v-model.number="session.conditions.windspeed"
                  label="Windspeed"
                ></v-text-field>

                <v-text-field
                  v-model.number="session.conditions.windgust"
                  label="Windgust"
                ></v-text-field>

                <v-text-field
                  v-model.number="session.conditions.winddirection"
                  label="Winddirection"
                ></v-text-field>

                <v-text-field
                  v-model.number="session.conditions.temperature"
                  label="Temperature"
                ></v-text-field>
              </div>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12 md6 pa-4>
        <v-card>
          <v-card-title>What gear did you use?</v-card-title>
          <v-card-text>
            <v-layout column>
              <v-select
                v-model="session.gear.sail"
                :items="[session.gear.sail]"
                label="Sail"
              ></v-select>

              <v-select
                v-model="session.gear.board"
                :items="[session.gear.board]"
                label="Board"
              ></v-select>

              <v-select
                v-model.number="session.rating"
                :items="[session.rating]"
                label="Rating"
              ></v-select>
            </v-layout>
          </v-card-text>
        </v-card>

        <v-card class="mt-8">
          <v-card-text>
            <v-layout column>
              <v-textarea
                v-model="session.note"
                label="How was your session?"
                rows="10"
              ></v-textarea>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'

import { Session } from '../../../../shared/interfaces/Session'

export default Vue.extend({
  name: 'SessionView',

  props: {
    session: Object as () => Session
  },

  computed: {
    date (): string {
      return new Date(this.session.date).toLocaleDateString()
    }
  }
})
</script>

<style lang="scss">
$grey: rgba(0, 0, 0, 0.1);

#session-view {
  .v-select__selection--disabled {
    color: rgba(0, 0, 0, 0.87) !important;
  }

  .v-input__slot:before {
    border-color: $grey !important;
  }

  .mdi-menu-down::before {
    color: $grey !important;
  }

  .v-input__slot:hover {
    cursor: default;
  }
}
</style>
