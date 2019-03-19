'use strict'
/* global d3, XMLHttpRequest, localStorage */

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

function checkLocalstorage () {
  const test = 'test'
  try {
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (err) {
    return false
  }
}

let localstorage = checkLocalstorage()

getData()
  .then(json => {
    document.getElementById('total-sessions').textContent = json.length

    return {
      sessions: parseSessionData(json),
      sail: parseUsage(json, 'sailSize'),
      board: parseUsage(json, 'board'),
      spots: parseUsage(json, 'spot')
    }
  })
  .then(data => {
    renderBarChart(data.sessions, 'session-amount')
    renderBarChart(data.sail, 'sail-usage')
    renderBarChart(data.board, 'board-usage')
    renderBarChart(data.spots, 'spot-visits')
  })
  .catch(err => console.error(err))

function getData (url) {
  return new Promise((resolve, reject) => {
    if (localstorage && localStorage.getItem('sessionData')) {
      const data = JSON.parse(localStorage.getItem('sessionData'))
      resolve(data)
    } else {
      request('/data')
        .then(data => {
          if (localStorage) localStorage.setItem('sessionData', JSON.stringify(data))
          resolve(data)
        })
        .catch(err => reject(err))
    }
  })
}

function request (url) {
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest()

    req.onreadystatechange = function () {
      if (req.readyState === 4 && req.status === 200) {
        resolve(JSON.parse(req.responseText))
      } else if (req.status === 404) {
        reject(new Error('The server responded with 404, not found'))
      }
    }
    req.open('GET', url, true)
    req.send()
  })
}

function parseUsage (data, type) {
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

function parseSessionData (data) {
  let array = []

  data.sort((a, b) => {
    let c = a.date.split('-').reverse()
    let d = b.date.split('-').reverse()
    return new Date(c) - new Date(d)
  })

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

function renderBarChart (data, svgId) {
  const dimensions = {
    width: document.getElementById(svgId).clientWidth,
    height: 500
  }
  const margin = {
    top: 10,
    right: 0,
    bottom: 30,
    left: 30
  }

  var x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([margin.left, dimensions.width - margin.right])
    .padding(0.1)

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)]).nice()
    .range([dimensions.height - margin.bottom, margin.top])

  var xAxis = g => g
    .attr('transform', `translate(0,${dimensions.height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))

  var yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select('.domain').remove())
    .call(d3.axisLeft(y).ticks(d3.max(data, d => d.count)))

  const svg = d3.select(`#${svgId}`)
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  svg.append('g')
    .attr('fill', 'steelblue')
    .selectAll('rect').data(data).enter().append('rect')
    .attr('x', d => x(d.name))
    .attr('y', d => y(d.count))
    .attr('height', d => y(0) - y(d.count))
    .attr('width', x.bandwidth())

  svg.append('g')
    .call(xAxis)

  svg.append('g')
    .call(yAxis)
}
