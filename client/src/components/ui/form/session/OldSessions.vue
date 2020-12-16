<template>
  <v-card color="background">
    <v-card-title>Upload old sessions</v-card-title>

    <v-card-text>
      <v-form
        id="old-sessions-form"
        @submit.prevent="submit">
          <v-file-input
          v-model="oldSessions"
          required
          :rules="required"
          accept=".json,application/json"
          label="Old sessions in .json format">
          </v-file-input>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
      color="secondary"
      text
      large
      type="submit"
      form="old-sessions-form"
      >Upload</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'OldSessions',

  props: {
    minHeight: String
  },

  data () {
    return {
      oldSessions: null,
      required: [
        (v) => !!v || 'All fields are required'
      ]
    }
  },

  methods: {
    submit () {
      const reader = new FileReader()

      reader.onload = e => {
        this.$emit('uploadOldSessions', JSON.parse(e.target.result))
      }
      reader.readAsText(this.oldSessions)
    }
  }
}
</script>
