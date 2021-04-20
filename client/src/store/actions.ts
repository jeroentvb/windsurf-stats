import router from '@/router'

import api from '@/services/api'
import transform from '@/services/transformer'

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_REGISTER,
  SET_USERDATA,
  STOP_LOADING,
  UPDATE_GEAR,
  UPDATE_SPOTS,
  ADD_SESSION,
  UPDATE_THRESHOLD,
  UPDATE_SESSION,
  UPDATE_EMAIL
} from './constants'

import { User } from '../../../shared/interfaces/User'
import { Spot } from '../../../shared/interfaces/Spot'
import { Gear } from '../../../shared/interfaces/Gear'
import { Session } from '../../../shared/interfaces/Session'

import { ActionTree } from 'vuex'
import { State } from '@/interfaces'

const storeActions: ActionTree<State, State> = {
  async [USER_REGISTER] ({ commit }, payload: User) {
    try {
      const res = await api.post('register', {
        name: payload.name,
        email: payload.email,
        password: payload.password
      })

      if (res.status === 200) {
        commit(USER_REGISTER)
        router.push('/gear')
      }
    } catch (err) {
      const status = err.response.status

      if (status === 409) {
        throw new Error('E-mail or username is already used')
      } else if (status === 422) {
        throw new Error('Field missing')
      } else if (status === 403) {
        throw new Error('Registering is not allowed at this time')
      }

      throw new Error('Something went wrong. Try again later.')
    }
  },

  async [USER_LOGIN] ({ dispatch, commit }, payload: User) {
    try {
      const res = await api.post('login', payload)
      const response = await api.get('user')

      if (res.status === 200 && response.status === 200) {
        dispatch(SET_USERDATA, response.data as User)
      }
    } catch (err) {
      const status = err.response ? err.response.status : err.message

      if (status === 422 || status === 401) {
        throw status
      } else {
        throw err
      }
    }
  },

  [USER_LOGOUT] ({ commit }) {
    commit(USER_LOGOUT)
    router.push('login')
  },

  [SET_USERDATA] ({ commit }, payload: User) {
    commit(SET_USERDATA, payload)
    commit(USER_LOGIN)

    if (router.currentRoute.query.redirect) {
      router.push(router.currentRoute.query.redirect as string)
    } else {
      router.push('/')
    }

    commit(STOP_LOADING)
  },

  async [ADD_SESSION] ({ commit }, payload: Session) {
    const session = transform.session(payload)

    try {
      const res = await api.post('session', session)

      if (res.status === 200) {
        commit(ADD_SESSION, payload)
        router.push('/')
      }
    } catch (err) {
      if (err.response.status === 422) {
        throw new Error('422')
      } else {
        throw err
      }
    }
  },

  async [UPDATE_SESSION] ({ commit }, payload: Session) {
    const session = transform.session(payload)

    try {
      const { status } = await api.patch('session', session)

      if (status === 200) {
        commit(UPDATE_SESSION, payload)
      }
    } catch (err) {
      throw err
    }
  },

  async [UPDATE_SPOTS] ({ commit }, payload: Spot[]) {
    try {
      const res = await api.post('spots', payload)

      if (res.status === 200) {
        commit(UPDATE_SPOTS, res.data)
      }
    } catch (err) {
      throw err
    }
  },

  async [UPDATE_THRESHOLD] ({ commit }, payload: number) {
    try {
      const res = await api.post('threshold', { payload })

      if (res.status === 200) {
        commit(UPDATE_THRESHOLD, payload)
      }
    } catch (err) {
      throw err
    }
  },

  async [UPDATE_GEAR] ({ commit }, payload: Gear) {
    try {
      const res = await api.post('gear', payload)

      if (res.status === 200) {
        commit(UPDATE_GEAR, payload)
      }
    } catch (err) {
      throw err
    }
  },

  async [UPDATE_EMAIL] ({ commit }, payload: Partial<User>) {
    try {
      const res = await api.post('email', payload)

      if (res.status === 200) {
        commit(UPDATE_EMAIL, payload.email)
      }
    } catch (err) {
      throw (err)
    }
  }
}

export default storeActions
