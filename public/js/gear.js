import { element } from './modules/element.js'

// const form = document.getElementsByTagName('form')[0]
const fieldset = document.getElementById('gear-sails')
const button = element.button('Add another sail', ['button--large', 'add-sail'])
let showSail = 6

if (document.body.clientWidth < 767) {
  for (let i = 6; i < fieldset.children.length; i++) {
    if (fieldset.children[i].children[1].value === '') {
      fieldset.children[i].classList.add('hidden')
    } else {
      showSail++
    }
  }

  // form.insertBefore(button, fieldset.nextElementSibling)
  fieldset.appendChild(button)

  button.addEventListener('click', e => {
    e.preventDefault()

    fieldset.children[showSail].classList.remove('hidden')
    showSail++

    if (showSail === 11) button.remove()
  })
}
