'use strict'

if (document.getElementById('register-form') !== undefined) {
  const password = document.getElementById('password')
  const repeatPassword = document.getElementById('repeat-password')
  const submit = document.getElementById('submit')

  submit.addEventListener('click', e => {
    if (password.value !== repeatPassword.value) {
      e.preventDefault()
      window.alert('Confirmed password does not match.')
    }
  })
}
