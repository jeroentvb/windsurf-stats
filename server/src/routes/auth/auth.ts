import app from '../../index'
import auth from './auth.controller'

app
  .post('/register', auth.register)
  .post('/login', auth.login)
  .post('/logout', auth.logout)
