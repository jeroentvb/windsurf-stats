import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import router from '@/router'

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_REGISTER,
  SET_USERDATA,
  STOP_LOADING
} from './constants'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loggedIn: false,
    newAccount: true,
    loading: true,
    user: {}
  },

  mutations: {
    [USER_REGISTER] (state) {
      state.loggedIn = true
      state.newAccount = true
    },

    [USER_LOGIN] (state) {
      state.loggedIn = true
      // router.push('/')
    },

    [USER_LOGOUT] (state) {
      state.loggedIn = false
    },

    [SET_USERDATA] (state, payload) {
      state.user = payload
    },

    [STOP_LOADING] (state) {
      state.loading = false
    }
  },

  actions: {
    [USER_REGISTER] (context) {
      context.commit(USER_REGISTER)
      router.push('/gear')
    },

    [USER_LOGIN] (context) {
      context.commit(USER_LOGIN)
      if (router.currentRoute.query.redirect) {
        router.push(router.currentRoute.query.redirect as string)
      } else {
        router.push('/')
      }
    },

    [USER_LOGOUT] (context) {
      console.warn('logging out')
      context.commit(USER_LOGOUT)
      router.push('login')
    },

    [SET_USERDATA] ({ dispatch, commit }, payload) {
      commit(SET_USERDATA, payload)
      commit(STOP_LOADING)
      dispatch(USER_LOGIN)
    }
  },
  modules: {
  }
})
