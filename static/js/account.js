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

  var form = {
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

  form.password.show.addEventListener('click', function () {
    form.password.form.classList.remove('hidden')
  })

  form.password.submit.addEventListener('click', function (e) {
    console.log('test')
    if (form.password.new.value !== form.password.confirm.value) {
      e.preventDefault()
      window.alert('Confirmed password does not match.')
    }
  })

  if (document.getElementById('update-email')) {
    form.email.show.addEventListener('click', function () {
      form.email.form.classList.remove('hidden')
    })
  }

  if (document.getElementById('api-key')) {
    var button = document.getElementById('api-key')
    var input = document.getElementById('generated-key')
    var userApiKey = document.getElementById('user-api-key')

    button.addEventListener('click', function (e) {
      e.preventDefault()
      request('/api-key')
        .then(res => res)
        .then(key => {
          input.value = key
          userApiKey.textContent = key

          button.disabled = true
        })
        .catch(err => console.error(err))
    })
  }
})()
