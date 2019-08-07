import { element } from './modules/element.js'

const form = {
  username: document.getElementById('username'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  repeatPassword: document.getElementById('repeat-password'),
  submit: document.getElementById('submit')
}
const error = document.getElementById('error')

function renderError (msg) {
  const p = element.paragraph(msg)

  element.update(error, p)
}

function invalidField (el) {
  el.value = ''
  el.style.border = '1px solid red'
}

form.submit.addEventListener('click', e => {
  if (form.password.value !== form.repeatPassword.value) {
    e.preventDefault()

    invalidField(form.password)
    invalidField(form.repeatPassword)

    renderError('Password didn\'t match.')
  }
})
