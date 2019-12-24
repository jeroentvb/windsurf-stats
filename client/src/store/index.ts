import Vue from 'vue'
import Vuex from 'vuex'
import { USER_LOGIN, USER_LOGOUT } from './constants'
import router from '@/router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedIn: false
  },

  mutations: {
    [USER_LOGIN] (state) {
      state.loggedIn = true
      router.push('/')
    },

    [USER_LOGOUT] (state) {
      console.warn('logging out')
      state.loggedIn = false
      router.push('login')
    }
  },

  actions: {
    [USER_LOGIN] (context) {
      context.commit(USER_LOGIN)
    },

    [USER_LOGOUT] (context) {
      context.commit(USER_LOGOUT)
    }
  },
  modules: {
  }
})
