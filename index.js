const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const fs = require('fs')

var options = {
  port: 25561
}

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .use(bodyParser.urlencoded({extended: true}))
  .get('/', index)
  .post('/submit-data', submitData)
  .use(notFound)
  .listen(options.port, () => console.log(chalk.green(`Server listening on port ${options.port}...`)))

function index(req, res) {
  res.render('index', {
    page: 'Home'
  })
}

function submitData(req, res, next) {
  var dateToday = req.body.dateToday
  var dateOther = req.body.dateOther
  var spot = req.body.spot
  var sailSize = req.body.sailSize
  var board = req.body.windsurfBoard
  var rating = req.body.rating
  var note = req.body.note

  console.log(spot, sailSize, board, rating, note)
}

function gatherData(req, res) {
  var windfinder = {
    spot: '',
    windspeed: new Array,
    windgust: new Array,
    winddirection: new Array
  }

  request(options.windfinderUrl, function(error, response, html) {
    if(error) {
      res.render('error', {
        page: 'error',
        error: error
      })
      throw error
    } else {
      var $ = cheerio.load(html)

      // Get the spots name
      $('#spotheader-spotname').filter(function() {
        windfinder.spot = $(this).text()
      })

      // Get the dates
      $('.weathertable__header').find($('h4')).filter(function(i) {
        windfinder.date[i] = $(this).text()
      })

      // Get the time
      $('.data-time').find($('.value')).filter(function(i) {
        // console.log($(this).text())
        windfinder.time[i] = $(this).text()
      })
      spliceToFirstDay(windfinder.time)

      // Get the average wind speed
      $('.data--major').find($('.units-ws')).filter(function(i) {
        windfinder.windspeed[i] = $(this).text()
      })
      spliceToFirstDay(windfinder.windspeed)

      // Get the wind gusts
      $('.data-gusts').find($('.units-ws')).filter(function(i) {
        windfinder.windgust[i] = $(this).text()
      })
      spliceToFirstDay(windfinder.windgust)

      // Get the wind direction; do some converting
      $('.data-direction-arrow').find($('.directionarrow')).filter(function(i) {
        var data = parseInt($(this).attr('title').replace('°', ' ')) - 180
        // This can be used to calculate the wind direction in wind direction instead of angles
        // var val = Math.floor((data / 22.5) + 0.5)
        // var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        // windDirection[i] = windDirections[(val % 16)]
        windfinder.winddirection[i] = data
      })
      spliceToFirstDay(windfinder.winddirection)
    }
  })
}

function spliceToFirstDay(array) {
  // Remove the first 7 hours
  array.splice(0, 7)
  // Remove other days
  array.splice(16, 50)
}

function spliceToDayHours(array) {
  // Remove the first 7 hours
  array.splice(0, 7)
  // Remove the night between day 1 and 2
  array.splice(16, 8)
  // Remove the night between day 2 and 3
  array.splice(32, 8)
  // Remove last hour of day 3 (23h)
  array.splice(48, 10)
}

function notFound(req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
