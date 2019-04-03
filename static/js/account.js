/* global XMLHttpRequest */

(function () {
  function request (url) {
    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest()

      req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
          resolve(JSON.parse(req.responseText))
        } else if (req.status === 404) {
          reject(new Error('The server responded with 404, not found'))
        }
      }
      req.open('GET', url, true)
      req.send()
    })
  }

  const form = {
    password: {
      form: document.getElementById('change-password-form'),
      show: document.getElementById('change-password'),
      submit: document.getElementById('submit-change-password'),
      old: document.getElementById('old-password'),
      new: document.getElementById('new-password'),
      confirm: document.getElementById('confirm-password')
    },
    email: {
      form: document.getElementById('update-email'),
      show: document.getElementById('change-email')
    }
  }

  form.password.show.addEventListener('click', () => {
    if (form.password.form.classList.contains('hidden')) {
      form.password.form.classList.remove('hidden')
    } else {
      form.password.form.classList.add('hidden')
    }
  })

  form.password.submit.addEventListener('click', e => {
    if (form.password.new.value !== form.password.confirm.value) {
      e.preventDefault()
      window.alert('Confirmed password does not match.')
    }
  })

  if (document.getElementById('update-email')) {
    form.email.show.addEventListener('click', () => {
      if (form.email.form.classList.contains('hidden')) {
        form.email.form.classList.remove('hidden')
      } else {
        form.email.form.classList.add('hidden')
      }
    })
  }

  if (document.getElementById('api-key')) {
    const button = document.getElementById('api-key')
    const input = document.getElementById('generated-key')
    const userApiKey = document.getElementById('user-api-key')

    button.addEventListener('click', e => {
      e.preventDefault()
      request('/api-key')
        .then(key => {
          input.value = key
          userApiKey.textContent = key

          button.disabled = true
        })
        .catch(err => console.error(err))
    })
  }

  if (document.getElementById('delete-account-form')) {
    const button = document.getElementById('delete-account')
    const form = document.getElementById('delete-account-form')

    button.addEventListener('click', e => {
      if (form.classList.contains('hidden')) {
        form.classList.remove('hidden')
      } else {
        form.classList.add('hidden')
      }
    })
  }
})()
