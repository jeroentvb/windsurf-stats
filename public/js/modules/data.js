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

const get = {
  sessions: async user => {
    const url = user ? `/api/sessions?user=${user}` : '/api/sessions'

    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.json())
        // TODO: This filter belongs smoewhere else and should be dynamic/configurable
        .then(data => data.filter(session => session.rating >= 5.5))
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  },
  gear: async () => {
    return new Promise((resolve, reject) => {
      fetch('/api/gear')
        .then(res => res.json())
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  },
  years: sessions => {
    let years = []
    sessions.forEach((session, i) => {
      const year = session.date.split('-')[2]

      if (i === 0) {
        years.push(year)
      } else if (years.indexOf(year) === -1) {
        years.push(year)
      }
    })

    return years
  }
}

const parse = {
  months: data => {
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
  },
  sessions: (sessions, gear) => {
    let dataset = []
    let lastMonth
    let index = 1
    // const colors = [
    //   '#FEC800',
    //   '#FEE100',
    //   '#FEFE00',
    //   '#B8FF61',
    //   '#00FA00',
    //   '#00E600',
    //   '#11D411',
    //   '#25C192',
    //   '#00E6F0',
    //   '#00C8FE'
    // ]

    const colors = [
      '#ff3e30', // red
      '#ff930f', // orange
      '#ffe626', // yellow
      '#45ff24', // green
      '#009888', // teal
      '#00BCD9', // cyan
      '#3d61ff', // blue
      '#4B0082', // deep purple
      '#9400D3', // purple
      '#7C5547' // brown
    ]

    // Populate the dataset with empty days
    for (let i = 0; i < 31; i++) {
      dataset.push({
        data: [],
        sessions: [],
        backgroundColor: []
      })
    }

    sessions = data.sortByDate(sessions)

    sessions.forEach((session, i) => {
      const sessionMonth = parseInt(session.date.split('-')[1])

      if (i === 0) {
        const itemColor = colors[gear.sails.indexOf(session.sailSize.toString())] ? colors[gear.sails.indexOf(session.sailSize.toString())] : ''

        dataset[0] = {
          data: [1],
          sessions: [session],
          backgroundColor: [itemColor]
        }

        lastMonth = sessionMonth

        return
      }

      if (sessionMonth === lastMonth) {
        const itemColor = colors[gear.sails.indexOf(session.sailSize.toString())] ? colors[gear.sails.indexOf(session.sailSize.toString())] : ''

        dataset[index].data.push(1)
        dataset[index].sessions.push(session)
        dataset[index].backgroundColor.push(itemColor)

        index++

        return
      }

      if (sessionMonth === lastMonth + 1 || (lastMonth + 1 === 13 && sessionMonth === 1)) {
        const itemColor = colors[gear.sails.indexOf(session.sailSize.toString())] ? colors[gear.sails.indexOf(session.sailSize.toString())] : ''

        index = 0

        const length = dataset[index].data.push(1)
        dataset[index].sessions.push(session)
        dataset[index].backgroundColor.push(itemColor)

        dataset.forEach(datapoint => {
          for (let i = 0; i < length - 1; i++) {
            if (!datapoint.data[i]) datapoint.data[i] = 0
            if (!datapoint.sessions[i]) datapoint.sessions[i] = undefined
            if (!datapoint.backgroundColor[i]) datapoint.backgroundColor[i] = undefined
          }
        })

        lastMonth = sessionMonth
        index++

        return
      }

      if (sessionMonth !== lastMonth + 1 && lastMonth + 1 !== 13) {
        const itemColor = colors[gear.sails.indexOf(session.sailSize.toString())] ? colors[gear.sails.indexOf(session.sailSize.toString())] : ''
        index = 0
        const difference = sessionMonth - lastMonth - 1

        if (difference < 0) {
          const toDecember = 12 - lastMonth
          const toCurrentMonth = sessionMonth - 1

          for (let i = 0; i < toDecember; i++) {
            dataset[index].data.push(0)
            dataset[index].sessions.push(undefined)
            dataset[index].backgroundColor.push(undefined)
          }

          for (let i = 0; i < toCurrentMonth; i++) {
            dataset[index].data.push(0)
            dataset[index].sessions.push(undefined)
            dataset[index].backgroundColor.push(undefined)
          }

          const lastPush = dataset[index].data.push(1)
          dataset[index].sessions.push(session)
          dataset[index].backgroundColor.push(itemColor)

          dataset.forEach(datapoint => {
            for (let i = 0; i < lastPush - 1; i++) {
              if (!datapoint.data[i]) datapoint.data[i] = 0
              if (!datapoint.sessions[i]) datapoint.sessions[i] = undefined
              if (!datapoint.backgroundColor[i]) datapoint.backgroundColor[i] = undefined
            }
          })

          lastMonth = sessionMonth
          index++
        } else {
          for (let i = 0; i < difference; i++) {
            dataset[index].data.push(0)
            dataset[index].sessions.push(undefined)
            dataset[index].backgroundColor.push(undefined)
          }

          const lastPush = dataset[index].data.push(1)
          dataset[index].sessions.push(session)
          dataset[index].backgroundColor.push(itemColor)

          dataset.forEach(datapoint => {
            for (let i = 0; i < lastPush - 1; i++) {
              if (!datapoint.data[i]) datapoint.data[i] = 0
              if (!datapoint.sessions[i]) datapoint.sessions[i] = undefined
              if (!datapoint.backgroundColor[i]) datapoint.backgroundColor[i] = undefined
            }
          })

          lastMonth = sessionMonth
          index++
        }
      }
    })

    return dataset
  },
  usage: (data, type) => {
    let array = []
    data.forEach((session, i) => {
      var exists = false
      if (i === 0) {
        array.push({
          name: session[type],
          count: 1
        })
        return
      }

      array.forEach(item => {
        if (item.name === session[type]) {
          item.count++
          exists = true
        }
      })

      if (exists === false) {
        array.push({
          name: session[type],
          count: 1
        })
      }
    })

    if (type === 'sailSize') {
      array.sort((a, b) => {
        return a.name - b.name
      })
    } else {
      array.sort((a, b) => {
        return b.count - a.count
      })
    }

    return array
  }
}

const filter = {
  year: (sessions, year) => {
    const filtered = sessions.filter(session => session.date.includes(year))

    return filtered
  }
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
  parse,
  filter,
  sortByDate
}
