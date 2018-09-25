const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const request = require('request')
const mysql = require('mysql')
const cheerio = require('cheerio')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const fs = require('fs')

require('dotenv').config()

// create mysql connection
var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// connect to db
db.connect(function(err) {
  if (err) {
    throw err;
  } else {
    console.log(chalk.green('[MySql] connection established..'))
  }
})

var options = {
  port: 25561
}

module.exports = express()
  // .get('/createdb', createDb)
  // .get('/addtable', addTable)

  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .use(bodyParser.urlencoded({extended: true}))
  .use(session({
    store: new FileStore(options),
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
  }))
  .get('/', index)
  .post('/submit-data', submitData)
  .post('/confirm-submit', confirmedData)
  .use(notFound)
  .listen(options.port, () => console.log(chalk.green(`[Server] listening on port ${options.port}...`)))

function index(req, res) {
  res.render('index', {
    page: 'Home'
  })
}

function submitData(req, res) {
  console.log(chalk.yellow('Recieved data submission'))

  var date = req.body.date
  var spot = req.body.spot

  var submittedData = {
    sail: req.body.sailSize,
    board: req.body.windsurfBoard,
    rating: req.body.rating,
    note: req.body.note
  }

  var spotUrls = {
    schellinkhout: 'https://www.windfinder.com/weatherforecast/markermeer_schellinkhout',
    hondehemeltje: 'https://www.windfinder.com/weatherforecast/broekerhaven',
    andijk: 'https://www.windfinder.com/weatherforecast/jachthaven-stichting-andijk',
  }

  var windfinder = {
    time: new Array,
    windspeed: new Array,
    windgust: new Array,
    winddirection: new Array
  }

  var responses = {
    spot: '',
    time: '',
    windspeed: Number,
    windgust: Number,
    winddirection: '',
    index: Number
  }

  request(spotUrls[spot], function(error, response, html) {
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
        responses.spot = $(this).text()
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
        var data = parseInt($(this).attr('title').replace('°', ' '))// - 180
        // This can be used to calculate the wind direction in wind direction instead of angles
        var val = Math.floor((data / 22.5) + 0.5)
        var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        windfinder.winddirection[i] = windDirections[(val % 16)]
        // windfinder.winddirection[i] = data
      })
      spliceToFirstDay(windfinder.winddirection)

      // Gather all the data that's going to be used
      responses.windspeed =  Math.max(...windfinder.windspeed)
      responses.index = windfinder.windspeed.findIndex(function(el) {
        return el == responses.windspeed
      })
      responses.time = windfinder.time[responses.index]
      responses.windgust = windfinder.windgust[responses.index]
      responses.winddirection = windfinder.winddirection[responses.index]

      // exportData('windfinder', windfinder)
      // exportData('responses', responses)

      var allData = {...submittedData, ...responses}

      req.session.data = allData

      res.render('confirm-data', {
        page: 'Confirm submission',
        data: allData
      })
    }
  })
}

function confirmedData(req, res) {
  var checkCorrect = req.body.confirmData

  if (checkCorrect == 'incorrect') {
    req.session.data = {}
    res.redirect('/')
  } else {
    // create a query to store data in the db
  }
}

// For debugging
function exportData(name, jsonObject) {
  fs.writeFile(name + '-offline-data.json', JSON.stringify(jsonObject, null, 4), function(err) {
    if (err) {
      throw err
    } else {
      console.log(chalk.yellow('File written'))
    }
  })
  return
}

function spliceToFirstDay(array) {
  // Remove the first 7 hours
  array.splice(0, 9)
  // Remove other days
  array.splice(12, 60)
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

// // create database
// function createDb(req, res) {
//   var sql = 'CREATE DATABASE windsurf_statistics'
//   db.query(sql, function(err, result) {
//     if(err){
//       throw err
//     } else {
//       console.log(chalk.yellow(result))
//       res.send('Database created')
//     }
//   })
// }

// // create statistics table in db
// function addTable(req, res) {
//   var sql = 'CREATE TABLE IF NOT EXISTS windsurf_statistics.statistics(id int NOT NULL AUTO_INCREMENT, date DATE, spot VARCHAR(100), windspeed INT, windgust INT, wind_direction VARCHAR(30), sail_size FLOAT, board VARCHAR(30), rating FLOAT, note VARCHAR(255), PRIMARY KEY (id))'
//   db.query(sql, function(err, result) {
//     if(err) {
//       throw err
//     } else {
//       console.log(chalk.yellow(result))
//
//       var sql2 = 'CREATE TABLE IF NOT EXISTS windsurf_statistics.users(id int NOT NULL AUTO_INCREMENT, username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id))'
//       db.query(sql2, function(err, result) {
//         if(err) {
//           throw err
//         } else {
//           console.log(chalk.yellow(result))
//           res.send('Statistics & users table created created')
//         }
//       })
//     }
//   })
// }
