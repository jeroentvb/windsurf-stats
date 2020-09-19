
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
  UPDATE_THRESHOLD,
  UPDATE_SESSION
} from './constants'

import { User } from '../../../shared/interfaces/User'
import { Spot } from '../../../shared/interfaces/Spot'
import { Gear } from '../../../shared/interfaces/Gear'
import { Snackbar, State } from '../interfaces'
import { Session } from '../../../shared/interfaces/Session'
import { MutationTree } from 'vuex'

const mutations: MutationTree<State> = {
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

  [SET_USERDATA] (state, payload: User) {
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
    state.user.sessions = [
      ...(state.user.sessions as Session[]),
      payload
    ]
  },

  [UPDATE_SESSION] (state, payload: Session) {
    state.user.sessions = state.user.sessions!.map((session: Session) => {
      return session._id === payload._id ? payload : session
    })
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
}

export default mutations
