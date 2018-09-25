if (document.getElementById('submit-form') != undefined) {
  // Show wind-data input fields if session was not today
  var additionalStats = document.getElementById('additional-stats')
  var radioToday = document.getElementById('today')
  var radioOther = document.getElementById('other-day')

  radioOther.addEventListener('click', function() {
    additionalStats.classList.remove('hidden')
  })

  radioToday.addEventListener('click', function() {
    additionalStats.classList.add('hidden')
  })

  // Choosing other sail size
  var sailSize = document.getElementById('windsurf-sail-size')
  var otherSailSize = document.getElementById('windsurf-sail-size-other')

  sailSize.addEventListener('change', function() {
    if (sailSize.value == 'other') {
      otherSailSize.classList.remove('hidden')
    } else {
      otherSailSize.classList.add('hidden')
    }
  })

  // Check form before submitting
  var ratingInput = document.getElementById('rating')
  var noteInput = document.getElementById('note')
  var submitForm = document.getElementById('submit-form')

  submitForm.addEventListener('click', function(e) {
    if (ratingInput.value == '') {
      e.preventDefault()
      ratingInput.classList.add('error')
    } else {
      ratingInput.classList.remove('error')
    }
    if (noteInput.value == '') {
      e.preventDefault()
      noteInput.classList.add('error')
    } else {
      noteInput.classList.remove('error')
    }
    if (otherSailSize.classList.contains('hidden') == false && otherSailSize.value == '') {
      e.preventDefault()
      otherSailSize.classList.add('error')
    } else {
      otherSailSize.classList.remove('error')
    }
  })
}
