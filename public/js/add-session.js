const form = document.getElementsByTagName('form')[0]
const manual = {
  input: document.getElementById('manual-input'),
  windspeed: document.getElementById('windspeed'),
  windgust: document.getElementById('windgust')
}
const radio = {
  today: document.getElementById('today'),
  otherDay: document.getElementById('other-day')
}
const fields = [
  {
    select: document.getElementById('spot'),
    other: document.getElementById('spot-other'),
    otherWrapper: document.getElementById('spot-other-wrapper')
  },
  {
    select: document.getElementById('sail'),
    other: document.getElementById('sail-other'),
    otherWrapper: document.getElementById('sail-other-wrapper')
  },
  {
    select: document.getElementById('board'),
    other: document.getElementById('board-other'),
    otherWrapper: document.getElementById('board-other-wrapper')
  }
]

// Hide/show manual input based on the radio buttons
for (let item in radio) {
  radio[item].addEventListener('click', e => {
    if (item === 'today') {
      manual.input.classList.add('hidden')
    } else {
      manual.input.classList.remove('hidden')
    }
  })
}

// Hide/show the 'other' input field
fields.forEach(field => {
  field.select.addEventListener('change', e => {
    if (e.target.value === 'other') {
      field.otherWrapper.classList.remove('hidden')
    } else {
      field.otherWrapper.classList.add('hidden')
    }
  })
})

// Check the form for errors before submitting
form.addEventListener('submit', e => {
  fields.forEach(field => checkOtherError(field, e))

  if (radio.otherDay.checked) {
    checkManualError(manual.windspeed, e)
    checkManualError(manual.windgust, e)
  }
})

function checkManualError (field, event) {
  if (field.value === '') {
    event.preventDefault()

    field.classList.add('error')
  } else {
    field.classList.remove('error')
  }
}

function checkOtherError (field, event) {
  if (!field.otherWrapper.classList.contains('hidden') && field.other.value === '') {
    event.preventDefault()

    field.other.classList.add('error')
  } else {
    field.other.classList.remove('error')
  }
}
