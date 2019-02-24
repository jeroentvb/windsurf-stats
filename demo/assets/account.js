var forms = {
  email: document.getElementById('update-email')
}

var changeEmail = document.getElementById('change-email')

changeEmail.addEventListener('click', function () {
  forms.email.classList.remove('hidden')
})
