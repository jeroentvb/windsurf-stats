/* global d3, XMLHttpRequest */

function init () {
  request('/data')
    .then(json => {
      return {
        sail: parseUsage(json, 'sailSize'),
        board: parseUsage(json, 'board')
      }
    })
    .then(data => {
      renderUsageGraph(data.sail, 'sail-usage')
      renderUsageGraph(data.board, 'board-usage')
    })
    .catch(err => console.error(err))
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

  return array.reverse()
}

function renderUsageGraph (data, svgId) {
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

init()
