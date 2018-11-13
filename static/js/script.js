var a = document.getElementsByTagName('a')
for (var i = 0; i < a.length; i++) {
  a[i].onclick = function () {
    window.location = this.getAttribute('href')
    return false
  }
}

var openMenu = document.getElementById('open-menu')
var closeMenu = document.getElementById('close-menu')
var menu = document.getElementById('menu')

function toggleMenu (remove, add) {
  return function () {
    menu.classList.remove(remove)
    menu.classList.add(add)
  }
}

openMenu.addEventListener('click', toggleMenu('hide-menu', 'show-menu'))
closeMenu.addEventListener('click', toggleMenu('show-menu', 'hide-menu'))
