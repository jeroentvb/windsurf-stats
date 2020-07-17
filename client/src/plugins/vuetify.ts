import Vue from 'vue'
import Vuetify from 'vuetify/lib'

import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    iconfont: 'mdi'
  },
  theme: {
    themes: {
      light: {
        primary: colors.blue.darken2,
        secondary: colors.blue.base,
        accent: colors.indigo.base,
        backgroud: colors.grey.lighten4
      }
    }
  }
})
