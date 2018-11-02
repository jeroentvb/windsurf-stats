// Function for showing other options
function hideShowOther (select, otherInput, wrap) {
  select.addEventListener('change', function () {
    if (select.value === 'other') {
      wrap.classList.remove('hidden')
    } else {
      wrap.classList.add('hidden')
    }
  })
}

// Check input fields that are visible by default
function checkInputError (input, e) {
  if (input.value === '') {
    e.preventDefault()
    input.classList.add('error')
  } else {
    input.classList.remove('error')
  }
}

// Check input fields that are NOT visible by default
function checkOtherInputError (otherInput, otherWrap, e) {
  if (otherWrap.classList.contains('hidden') === false && otherInput.value === '') {
    e.preventDefault()
    otherInput.classList.add('error')
  } else {
    otherInput.classList.remove('error')
  }
}

if (document.getElementById('submit-form') !== undefined) {
  // Show wind-data input fields if session was not today
  var additionalStats = document.getElementById('additional-stats')
  var radioToday = document.getElementById('today')
  var radioOther = document.getElementById('other-day')

  radioOther.addEventListener('click', function () {
    additionalStats.classList.remove('hidden')
  })

  radioToday.addEventListener('click', function () {
    additionalStats.classList.add('hidden')
  })

  // Choosing other spot
  var spot = document.getElementById('spot')
  var otherSpot = document.getElementById('spot-other')
  var otherSpotWrap = document.getElementById('spot-other-wrapper')

  hideShowOther(spot, otherSpot, otherSpotWrap)

  // Choosing other sail size
  var sailSize = document.getElementById('windsurf-sail-size')
  var otherSailSize = document.getElementById('windsurf-sail-size-other')
  var otherSailSizeWrap = document.getElementById('windsurf-sail-size-other-wrapper')

  hideShowOther(sailSize, otherSailSize, otherSailSizeWrap)

  // Choosing other board
  var windsurfBoard = document.getElementById('windsurf-board')
  var otherWindsurfBoard = document.getElementById('windsurf-board-other')
  var otherWindsurfBoardWrap = document.getElementById('windsurf-board-other-wrapper')

  hideShowOther(windsurfBoard, otherWindsurfBoard, otherWindsurfBoardWrap)

  // Check form before submitting
  var ratingInput = document.getElementById('rating')
  var noteInput = document.getElementById('note')
  var submitForm = document.getElementById('submit-form')

  submitForm.addEventListener('click', function (e) {
    checkInputError(ratingInput, e)
    checkInputError(noteInput, e)
    checkOtherInputError(otherSpot, otherSpotWrap, e)
    checkOtherInputError(otherSailSize, otherSailSizeWrap, e)
    checkOtherInputError(otherWindsurfBoard, otherWindsurfBoardWrap, e)
  })
}
