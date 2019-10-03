import { data } from './modules/data.js'
import { Graph } from './modules/chart.js'
import { select } from './modules/select.js'

async function init () {
  // Get the data and createthe dataset object
  const json = await data.get.sessions()
  const sessions = data.sortByDate(json)
  const gear = await data.get.gear()

  const dataset = {
    sessions: {
      all: data.parse.sessions(sessions, gear)
    },
    labels: {
      all: data.parse.months(sessions).map(label => label.name)
    },
    gear,
    years: data.get.years(sessions)
  }

  dataset.years.forEach(year => {
    const filteredSessions = data.filter.year(sessions, year)

    dataset.sessions[year] = data.parse.sessions(filteredSessions, gear)
    dataset.labels[year] = data.parse.months(filteredSessions).map(label => label.name)
  })

  // Something doesn't work with the select mechanism
  select.year.addOptions(dataset.years, e => {
    const year = e.target.value

    chart.changeYear(year)
  })

  // render the chart
  const chart = new Graph(dataset)
  chart.render()
}

init()
