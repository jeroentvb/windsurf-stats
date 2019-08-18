export const select = {
  year: {
    input: document.getElementById('select-year'),
    addOptions: (years, callback) => {
      years.forEach(year => {
        select.year.input.appendChild(select.createOption(year))
      })

      select.year.input.appendChild(select.createOption('all'))
      select.year.input.selectedIndex = years.length - 1

      select.year.input.addEventListener('change', e => {
        callback(e)
      })
    }
  },
  createOption: value => {
    const option = document.createElement('option')
    option.value = value

    const text = document.createTextNode(value)
    option.appendChild(text)

    return option
  }
}
