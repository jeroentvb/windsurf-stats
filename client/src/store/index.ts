import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import router from '@/router'

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_REGISTER,
  SET_USERDATA,
  STOP_LOADING,
  UPDATE_GEAR,
  UPDATE_SPOTS,
  SHOW_SNACKBAR,
  CLOSE_SNACKBAR,
  ADD_SESSION,
  UPDATE_THRESHOLD
} from './constants'

import { User } from '../../../shared/interfaces/User'
import { Spot } from '../../../shared/interfaces/Spot'
import { Gear } from '../../../shared/interfaces/Gear'
import { Snackbar } from '../interfaces'
import { Session } from '../../../shared/interfaces/Session'

Vue.use(Vuex)

export default new Vuex.Store({
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
      timeout: 3000,
      show: false,
      type: ''
    }
  },

  mutations: {
    [USER_REGISTER] (state) {
      state.loggedIn = true
      state.newAccount = true
    },

    [USER_LOGIN] (state) {
      state.loggedIn = true
    },

    [USER_LOGOUT] (state) {
      state.loggedIn = false
    },

    [SET_USERDATA] (state, payload) {
      state.user = payload
    },

    [STOP_LOADING] (state) {
      state.loading = false
    },

    [UPDATE_GEAR] (state, payload: Gear) {
      state.user.gear = payload
    },

    [UPDATE_SPOTS] (state, payload: Spot[]) {
      state.user.spots = payload
    },

    [ADD_SESSION] (state, payload) {
      (state.user.sessions as Session[]).push(payload)
    },

    [SHOW_SNACKBAR] (state, payload: Snackbar) {
      state.snackbar = {
        ...Object.assign(state.snackbar, payload),
        show: true
      }
    },

    [CLOSE_SNACKBAR] (state) {
      state.snackbar = Object.assign(state.snackbar, { show: false })
    },

    [UPDATE_THRESHOLD] (state, payload: number) {
      state.user.threshold = payload
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
    },

    [ADD_SESSION] ({ commit }, payload) {
      commit(ADD_SESSION, payload)
      router.push('/')
    }
  },
  modules: {
  }
})
