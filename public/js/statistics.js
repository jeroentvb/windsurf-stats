import { data } from './modules/data.js'
import { Graph } from './modules/chart.js'
import { select } from './modules/select.js'

async function init () {
  // Get the data and createthe dataset object
  const json = await data.get.sessions()
  const sessions = data.sortByDate(json)
  const gear = await data.get.gear()
  const sessionAmount = document.getElementById('session-amount')

  // Construct the (partially filled) dataset object
  const dataset = {
    sessions: {
      all: data.parse.sessions(sessions, gear)
    },
    sessionAmounts: {
      all: sessions.length
    },
    sails: {
      all: data.parse.usage(sessions, 'sailSize')
    },
    boards: {
      all: data.parse.usage(sessions, 'board')
    },
    spots: {
      all: data.parse.usage(sessions, 'spot')
    },
    labels: {
      all: data.parse.months(sessions).map(label => label.name)
    },
    gear,
    years: data.get.years(sessions)
  }

  // Add all statistics for every year
  dataset.years.forEach(year => {
    const filteredSessions = data.filter.year(sessions, year)

    dataset.sessions[year] = data.parse.sessions(filteredSessions, gear)

    dataset.sessionAmounts[year] = sessions.filter(session => session.date.includes(year)).length

    dataset.labels[year] = data.parse.months(filteredSessions).map(label => label.name)
    dataset.sails[year] = data.parse.usage(filteredSessions, 'sailSize')
    dataset.boards[year] = data.parse.usage(filteredSessions, 'board')
    dataset.spots[year] = data.parse.usage(filteredSessions, 'spot')
  })

  // Add selection options to switch to available years
  select.year.addOptions(dataset.years, e => {
    const year = e.target.value

    chart.changeYear(year)
    sessionAmount.textContent = dataset.sessionAmounts[year]
  })

  document.getElementById('select-chart').addEventListener('change', e => {
    chart.render(e.target.value)
  })

  // render the chart
  const chart = new Graph(dataset)
  chart.render('sessions')
  sessionAmount.textContent = dataset.sessionAmounts.all
}

init()
