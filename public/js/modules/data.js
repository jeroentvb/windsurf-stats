/* global fetch */

const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
]

async function get (user) {
  const url = user ? `/sessions?user=${user}` : '/sessions'

  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => reject(err))
  })
}

function sessions (data) {
  let array = []

  data.forEach((session, i) => {
    let month = parseInt(session.date.split('-')[1])
    let year = parseInt(session.date.split('-')[2])
    let shortDate = `${months[month - 1]} ${year}`
    let exist = false

    if (i === 0) {
      array.push({
        name: shortDate,
        count: 1,
        month: month
      })
      return
    }

    array.forEach(item => {
      if (item.name === shortDate) {
        item.count++
        exist = true
      }
    })

    if (!exist) {
      const lastMonth = array[array.length - 1].month

      if (lastMonth + 1 === 13) {
        array.push({
          name: shortDate,
          count: 1,
          month: month
        })
      } else if (lastMonth + 1 !== month) {
        const difference = month - lastMonth - 1

        if (difference < 0) {
          // If there is more than one empty month and it spans over new year
          const toDecember = 12 - lastMonth
          const toCurrentMonth = month - 1

          // Add all months to new year
          for (let j = 0; j < toDecember; j++) {
            array.push({
              name: months[lastMonth + j] ? `${months[lastMonth + j]} ${year - 1}` : `${months[11]} ${year - 1}`,
              count: 0,
              month: lastMonth + (1 + j) === 13 ? 1 : lastMonth + (1 + j)
            })
          }

          // Add all months to current month
          for (let j = 0; j < toCurrentMonth; j++) {
            array.push({
              name: `${months[j]} ${year}`,
              count: 0,
              month: j + 1
            })
          }

          array.push({
            name: shortDate,
            count: 1,
            month: month
          })
        } else {
          // If there is more than one empty month, add the right amount of empty months
          for (let j = difference; j > 0; j--) {
            array.push({
              name: months[month - (1 + j)] ? `${months[month - (1 + j)]} ${year}` : `${months[11]} ${year - 1}`,
              count: 0,
              month: month - (1 + j) === 0 ? 12 : month - (1 + j)
            })
          }

          array.push({
            name: shortDate,
            count: 1,
            month: month
          })
        }
      } else {
        array.push({
          name: shortDate,
          count: 1,
          month: month
        })
      }
    }
  })

  return array
}

function sortByDate (data) {
  return data.sort((a, b) => {
    const c = a.date.split('-').reverse()
    const d = b.date.split('-').reverse()

    return new Date(c) - new Date(d)
  })
}

export const data = {
  get,
  parse: {
    sessions
  },
  sortByDate
}
