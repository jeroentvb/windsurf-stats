import store from '../store'

import { SHOW_SNACKBAR, CLOSE_SNACKBAR } from '@/store/constants'
import { Snackbar } from '@/interfaces'

function succes (text: string, timeout = 5000) {
  store.commit(SHOW_SNACKBAR, {
    text,
    timeout,
    type: 'succes'
  } as Snackbar)
}

function info (text: string, timeout = 5000) {
  store.commit(SHOW_SNACKBAR, {
    text,
    timeout,
    type: 'info'
  } as Snackbar)
}

function error (text = 'Something went wrong!', timeout = 5000) {
  store.commit(SHOW_SNACKBAR, {
    text,
    timeout,
    type: 'error'
  } as Snackbar)
}

function close () {
  store.commit(CLOSE_SNACKBAR)
}

export default {
  succes,
  info,
  error,
  close
}
