if (document.getElementById('register-form') !== undefined) {
  var password = document.getElementById('password')
  var repeatPassword = document.getElementById('repeat-password')
  var submit = document.getElementById('submit')

  submit.addEventListener('click', function (e) {
    if (password.value !== repeatPassword.value) {
      e.preventDefault()
      window.alert('Confirmed password does not match.')
    }
  })
}
