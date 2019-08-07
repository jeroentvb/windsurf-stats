import { element } from './modules/element.js'

const form = document.getElementsByTagName('form')[0]
const fieldset = document.getElementById('gear-sails')
const button = element.button('Add another sail', 'button--medium')
let showSail = 5

for (let i = 5; i < fieldset.children.length; i++) {
  fieldset.children[i].classList.add('hidden')
}

form.insertBefore(button, fieldset.nextElementSibling)

button.addEventListener('click', e => {
  e.preventDefault()

  fieldset.children[showSail].classList.remove('hidden')
  showSail++

  if (showSail === 10) button.remove()
})
