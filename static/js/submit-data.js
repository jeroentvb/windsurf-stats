// Function for showing other options
function hideShowOther (select, otherInput, wrap) {
  if (select.value === 'other') wrap.classList.remove('hidden')
  select.addEventListener('change', () => {
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

// Empty other value field if the option of top element isn't other
function checkOtherValue (el, elOther) {
  if (el.value !== 'other') elOther.value = ''
}

if (document.getElementById('submit-form') !== undefined) {
  // Show wind-data input fields if session was not today
  const additionalStats = document.getElementById('additional-stats')
  const radioToday = document.getElementById('today')
  const radioOther = document.getElementById('other-day')
  const hourField = document.getElementById('hour-field')

  radioOther.addEventListener('click', () => {
    additionalStats.classList.remove('hidden')
    hourField.classList.add('hidden')
  })

  radioToday.addEventListener('click', () => {
    additionalStats.classList.add('hidden')
    hourField.classList.remove('hidden')
  })

  // Choosing other spot
  const spot = document.getElementById('spot')
  const otherSpot = document.getElementById('spot-other')
  const otherSpotWrap = document.getElementById('spot-other-wrapper')

  hideShowOther(spot, otherSpot, otherSpotWrap)

  // Choosing other sail size
  const sailSize = document.getElementById('windsurf-sail-size')
  const otherSailSize = document.getElementById('windsurf-sail-size-other')
  const otherSailSizeWrap = document.getElementById('windsurf-sail-size-other-wrapper')

  hideShowOther(sailSize, otherSailSize, otherSailSizeWrap)

  // Choosing other board
  const windsurfBoard = document.getElementById('windsurf-board')
  const otherWindsurfBoard = document.getElementById('windsurf-board-other')
  const otherWindsurfBoardWrap = document.getElementById('windsurf-board-other-wrapper')

  hideShowOther(windsurfBoard, otherWindsurfBoard, otherWindsurfBoardWrap)

  // Check form before submitting
  const submitForm = document.getElementById('submit-form')

  const manualInput = {
    windspeed: document.getElementById('windspeed'),
    windgust: document.getElementById('windgust')
  }

  const dropdowns = [
    [
      spot,
      otherSpot
    ],
    [
      sailSize,
      otherSailSize
    ],
    [
      windsurfBoard,
      otherWindsurfBoard
    ]
  ]

  submitForm.addEventListener('click', e => {
    if (radioOther.checked) {
      checkInputError(manualInput.windspeed, e)
      checkInputError(manualInput.windgust, e)
    }
    checkOtherInputError(otherSpot, otherSpotWrap, e)
    checkOtherInputError(otherSailSize, otherSailSizeWrap, e)
    checkOtherInputError(otherWindsurfBoard, otherWindsurfBoardWrap, e)

    dropdowns.forEach(dropdown => checkOtherValue(dropdown[0], dropdown[1]))
  })
}
