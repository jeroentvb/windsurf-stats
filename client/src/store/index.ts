import Vue from 'vue'
import Vuex from 'vuex'

import { State } from '../interfaces'
import { User } from '../../../shared/interfaces/User'

import mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)

export default new Vuex.Store<State>({
  strict: process.env.NODE_ENV === 'development',
  state: {
    loggedIn: false,
    newAccount: true,
    loading: true,
    user: {
      name: '',
      email: '',
      gear: {
        sails: [],
        boards: []
      },
      spots: [],
      sessions: [],
      threshold: 5
    } as User,
    snackbar: {
      text: '',
      timeout: 4000,
      show: false,
      type: 'info'
    }
  },

  mutations,
  actions,
  modules: {
  }
})
