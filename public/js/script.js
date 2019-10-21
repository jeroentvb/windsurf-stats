const openMenu = document.getElementById('open-menu')
const closeMenu = document.getElementById('close-menu')
const menu = document.getElementById('menu')

function toggleMenu (remove, add) {
  return () => {
    menu.classList.remove(remove)
    menu.classList.add(add)
  }
}

if (document.getElementById('menu')) {
  openMenu.addEventListener('click', toggleMenu('hide-menu', 'show-menu'))
  closeMenu.addEventListener('click', toggleMenu('show-menu', 'hide-menu'))
}
