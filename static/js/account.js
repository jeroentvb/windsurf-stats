/* global XMLHttpRequest */

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

if (document.getElementById('update-email')) {
  var forms = {
    email: document.getElementById('update-email')
  }

  var changeEmail = document.getElementById('change-email')

  changeEmail.addEventListener('click', function () {
    forms.email.classList.remove('hidden')
  })
}

if (document.getElementById('api-key')) {
  var button = document.getElementById('api-key')
  var input = document.getElementById('generated-key')
  var userApiKey = document.getElementById('user-api-key')
  var form = document.getElementById('api-key-generator')
  //
  // if (userApiKey.textContent) form.classList.add('hidden')

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
