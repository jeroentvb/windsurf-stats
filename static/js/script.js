if(document.getElementById('submit-form') != undefined) {
  var ratingInput = document.getElementById('rating')
  var noteInput = document.getElementById('note')
  var submitForm = document.getElementById('submit-form')

  submitForm.addEventListener('click', function(e) {
    if(ratingInput.value == '') {
      e.preventDefault()
      ratingInput.style.backgroundColor = 'red'
    }
    if(noteInput.value == '') {
      e.preventDefault()
      noteInput.style.backgroundColor = 'red'
    }
  })
}
