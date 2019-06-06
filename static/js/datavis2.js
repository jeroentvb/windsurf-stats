/* global d3, fetch */

(async () => {
  const rawData = await fetch('/data')
  const sessions = await rawData.json()

  const parsedData = data.session(sessions)
  graph.render(parsedData)
})()

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

// {
//   board: 'F2 Stoke'
//   date: '15-10-2018'
//   note: 'Test'
//   rating: 7
//   sailSize: 5
//   spot: 'Markermeer / Schellinkhout'
//   windDirection: 'S'
//   windgust: 19
//   windspeed: 11
// }

const data = {
  session: data => {
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
          month: month,
          session1: session
        })
        return
      }

      array.forEach(item => {
        if (item.name === shortDate) {
          item.count++
          exist = true
          item[`session${item.count}`] = session
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
}

const graph = {
  render: data => {
    const series = d3.stack().keys(data.columns.slice(1))(data)

    const dimensions = {
      width: document.getElementById(`#session-amount`).clientWidth,
      height: 500
    }

    const margin = {
      top: 10,
      right: 10,
      bottom: 20,
      left: 40
    }

    const svg = d3.select(`#session-amount`)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.left, dimensions.width - margin.right])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([dimensions.height - margin.bottom, margin.top])

    const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), series.length).reverse())
      .unknown('#ccc')

    const xAxis = g => g
      .attr('transform', `translate(0,${dimensions.height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll('.domain').remove())

    const yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, 's'))
      .call(g => g.selectAll('.domain').remove())

    const legend = svg => {
      const g = svg
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .attr('transform', `translate(${dimensions.width - margin.right},${margin.top})`)
        .selectAll('g')
        .data(series.slice().reverse())
        .join('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`)

      g.append('rect')
        .attr('x', -19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', d => color(d.key))

      g.append('text')
        .attr('x', -24)
        .attr('y', 9.5)
        .attr('dy', '0.35em')
        .text(d => d.key)
    }

    svg.append('g')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', (d, i) => x(d.data.name))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())

    svg.append('g')
      .call(xAxis)

    svg.append('g')
      .call(yAxis)

    svg.append('g')
      .call(legend)
  }
}
