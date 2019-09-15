function create (name, cssClass) {
  const el = document.createElement(name)

  if (Array.isArray(cssClass)) cssClass.forEach(css => el.classList.add(css))
  if (Array.isArray(cssClass) === false && cssClass) el.classList.add(cssClass)

  return el
}

function paragraph (content) {
  if (!content) console.warn('No content given!')

  const p = document.createElement('p')
  const text = document.createTextNode(content)

  p.appendChild(text)

  return p
}

function heading (headingType, content) {
  const headings = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6'
  ]

  if (headings.indexOf(headingType) === -1) throw new Error('"headingType" must be a heading')
  if (!content) console.warn('No content given!')

  const heading = document.createElement(headingType)
  const text = document.createTextNode(content)

  heading.appendChild(text)

  return heading
}

function button (content, cssClass) {
  if (!content) console.warn('No content given!')

  const btn = document.createElement('button')
  const text = document.createTextNode(content)

  if (Array.isArray(cssClass)) cssClass.forEach(css => btn.classList.add(css))
  if (Array.isArray(cssClass) === false && cssClass) btn.classList.add(cssClass)

  btn.appendChild(text)

  return btn
}

function image (src, alt, cssClass) {
  if (!src) throw new Error('No image source specified')
  if (typeof src !== 'string') throw new TypeError('Image src must be a string')

  const img = document.createElement('img')

  img.src = src

  if (cssClass) img.classList.add(cssClass)

  return img
}

function text (parent, content) {
  const text = document.createTextNode(content)

  parent.appendChild(text)
}

function update (el, elements, title) {
  return new Promise((resolve, reject) => {
    this.removeChildren(el)

    if (elements.length === undefined) {
      el.appendChild(elements)

      resolve()
    } else {
      elements.forEach(element => el.appendChild(element))

      resolve()
    }
  })
}

function removeChildren (el) {
  while (el.firstChild) el.removeChild(el.firstChild)
}

function appendChildren (el, elements) {
  elements.forEach(element => el.appendChild(element))
}

export const element = {
  create,
  paragraph,
  heading,
  button,
  image,
  text,
  update,
  removeChildren,
  appendChildren
}
