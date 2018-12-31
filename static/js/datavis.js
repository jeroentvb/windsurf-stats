/* global d3, fetch */

const margin = ({
  top: 10,
  right: 10,
  bottom: 20,
  left: 40
})

const width = 600
const height = 600

function init () {
  fetch('/data')
    .then(res => res.json())
    .then(json => parseData(json))
    .then(data => renderData(data))
    .catch(err => console.error(err))
}

function parseData (json) {
  let data = json
  data.names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dec'
  ]

  data.totals = []
  data.names.forEach(month => {
    data.totals.push(0)
  })

  json.forEach(session => {
    let month = session.date.split('-')[1]
    data.totals[month - 1]++
  })

  data.keys = [
    '<12',
    '12-15',
    '16-19',
    '20-23',
    '>23'
  ]

  return data
}

function renderData (data) {
  console.log(data)

  const x = d3.scaleBand()
    .domain(data.names)
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data.totals)])
    .rangeRound([height - margin.bottom, margin.top])

  const color = d3.scaleOrdinal()
    .unknown('#ccc')
    .domain(data.keys)
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())

  function xAxis (g) {
    return g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll('.domain').remove())
  }

  function yAxis (g) {
    return g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, 's'))
      .call(g => g.selectAll('.domain').remove())
  }

  const svg = d3.select('svg')

  svg.append('g')
    .selectAll('g')
    .data(data)
    .enter().append('g')
    .attr('fill', (d, i) => color(data.keys[i]))
    .selectAll('rect')
    .data(d => d)
    .enter().append('rect')
    .attr('x', (d, i) => x(data.names[i]))
    .attr('y', d => y(d[1]))
    .attr('height', d => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth())

  svg.append('g')
    .call(xAxis)

  svg.append('g')
    .call(yAxis)

  svg.append('g')
    .attr('transform', `translate(${width - margin.right},${margin.top})`)
    // .call(legend)
}

init()
