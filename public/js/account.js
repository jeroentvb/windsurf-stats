const button = {
  changePassword: document.getElementById('change-password'),
  changeEmail: document.getElementById('change-email'),
  deleteAccount: document.getElementById('delete-account')
}

for (let btn in button) {
  if (button[btn] !== null) {
    button[btn].addEventListener('click', e => {
      const selector = btn.split(/(?=[A-Z])/)[0] + '-' + btn.split(/(?=[A-Z])/)[1].charAt(0).toLowerCase() + btn.split(/(?=[A-Z])/)[1].substring(1) + '-form'
      const form = document.getElementById(selector)

      const forms = document.getElementsByTagName('form')

      for (let i = 0; i < forms.length; i++) {
        forms[i].classList.add('hidden')
      }

      form.classList.remove('hidden')
    })
  }
}
