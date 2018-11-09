const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const request = require('request')
const mysql = require('mysql')
const cheerio = require('cheerio')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const tools = require('./modules/tools')
const options = require('./modules/options')

require('dotenv').config()

// create mysql connection
var dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}
var db
function handleDisconnect () {
  db = mysql.createConnection(dbConfig)
  // connect to db
  db.connect(err => {
    if (err) {
      console.error('[MySql] error while connecting to the db:', err)
      setTimeout(handleDisconnect, 10000)
    }
    console.log(chalk.green('[MySql] connection established..'))
  })
  // Handle db errors
  db.on('error', err => {
    console.error('[MySql] db error:', err)
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect()
    } else {
      throw err
    }
  })
}
handleDisconnect()

// Wrap a database query in a promise to use throughout the application
function query (query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

// Wrap a request in a promise to use throughout the application
function getHtml (url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, html) => {
      if (err) reject(err)
      resolve(html)
    })
  })
}

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(session({
    store: new FileStore(),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 2592000000
    }
  }))
  .get('/', showStatistics)
  .get('/statistics', showStatistics)
  .get('/add-session', addSession)
  .get('/register', render)
  .get('/preferences', renderPreferences)
  .post('/set-prefs', preferences)
  .post('/update-prefs', preferences)
  .get('/login', render)
  .post('/sign-up', register)
  .post('/sign-in', login)
  .get('/sign-out', logout)
  .post('/submit-data', submitData)
  .post('/confirm-submit', confirmedData)
  .use(notFound)
  .listen(options.port, () => console.log(chalk.green(`[Server] listening on port ${options.port}...`)))

function render (req, res) {
  var id = req.originalUrl.replace('/', '')

  res.render(id, {
    page: id.charAt(0).toUpperCase() + id.substr(1),
    loginStatus: req.session.user
  })
}

function addSession (req, res, next) {
  query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id)
    .then(result => {
      let prefs = result[0]
      let formattedPrefs = {
        boards: [
          prefs.board0,
          prefs.board1,
          prefs.board2,
          prefs.board3,
          prefs.board4
        ],
        sails: [
          prefs.sail0,
          prefs.sail1,
          prefs.sail2,
          prefs.sail3,
          prefs.sail4,
          prefs.sail5,
          prefs.sail6,
          prefs.sail7,
          prefs.sail8,
          prefs.sail9
        ],
        spots: [
          prefs.spot0,
          prefs.spot1,
          prefs.spot2,
          prefs.spot3,
          prefs.spot4
        ],
        date: tools.getYesterday()
      }
      res.render('add-session', {
        page: 'Add session',
        loginStatus: req.session.user,
        prefs: formattedPrefs
      })
    })
    .catch(err => console.error(err))
}

function submitData (req, res) {
  console.log(chalk.yellow(`Recieved data submission from user ${req.session.user.name}`))

  let date = req.body.date

  let submittedData = {
    sail: req.body.sailSize,
    board: req.body.windsurfBoard,
    rating: req.body.rating,
    note: req.body.note,
    spot: req.body.spot
  }

  let additionalData = {
    date: req.body.dateInput,
    windspeed: req.body.windspeed,
    windgust: req.body.windgust,
    windDirection: req.body.windDirection
  }

  if (date === 'today') {
    submittedData.date = tools.getToday()

    var windfinder = {
      time: [],
      windspeed: [],
      windgust: [],
      windDirection: []
    }

    var responses = {
      spot: '',
      time: '',
      windspeed: Number,
      windgust: Number,
      windDirection: '',
      index: Number
    }

    getHtml(options.spotUrls[submittedData.spot])
      .then(html => {
        // Extract data from html
        var $ = cheerio.load(html)

        // Get the spots name
        $('#spotheader-spotname').filter(function () {
          responses.spot = $(this).text()
        })

        // Get the time
        $('.data-time').find($('.value')).filter(function (i) {
          // console.log($(this).text())
          windfinder.time[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.time)

        // Get the average wind speed
        $('.data--major').find($('.units-ws')).filter(function (i) {
          windfinder.windspeed[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.windspeed)

        // Get the wind gusts
        $('.data-gusts').find($('.units-ws')).filter(function (i) {
          windfinder.windgust[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.windgust)

        // Get the wind direction; do some converting
        $('.data-direction-arrow').find($('.directionarrow')).filter(function (i) {
          var data = parseInt($(this).attr('title').replace('°', ' '))// - 180
          // This can be used to calculate the wind direction in wind direction instead of angles
          var val = Math.floor((data / 22.5) + 0.5)
          var windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
          windfinder.windDirection[i] = windDirections[(val % 16)]
          // windfinder.windDirection[i] = data
        })
        tools.spliceToFirstDay(windfinder.windDirection)

        return windfinder
      })
      .then(windfinder => {
        // Gather all the data that's going to be used
        responses.windspeed = Math.max(...windfinder.windspeed)
        responses.index = windfinder.windspeed.findIndex(() => responses.windspeed)
        responses.time = windfinder.time[responses.index]
        responses.windgust = windfinder.windgust[responses.index]
        responses.windDirection = windfinder.windDirection[responses.index]

        let allData = {
          ...submittedData,
          ...responses
        }

        return allData
      })
      .then(allData => {
        res.render('confirm-data', {
          page: 'Confirm submission',
          data: allData,
          loginStatus: req.session.user
        })
      })
      .catch(err => {
        res.render('error', {
          page: 'error',
          error: err
        })
        console.error(err)
      })
  } else {
    let manualData = {
      ...submittedData,
      ...additionalData
    }
    res.render('confirm-data', {
      page: 'Confirm submission',
      data: manualData,
      loginStatus: req.session.user
    })
  }
}

function confirmedData (req, res, next) {
  var checkCorrect = req.body.confirmData

  var submittedData = {
    userId: req.session.user.id,
    date: req.body.date,
    spot: req.body.spot,
    windspeed: req.body.windspeed,
    windgust: req.body.windgust,
    windDirection: req.body.windDirection,
    sailSize: req.body.sail,
    board: req.body.board,
    rating: req.body.rating,
    note: req.body.note
  }

  if (checkCorrect === 'incorrect') {
    res.redirect('/')
  } else {
    query('INSERT INTO windsurfStatistics.statistics SET ?', submittedData)
      .then(res.redirect('statistics'))
      .catch(err => console.log(err))

    // Obsolete function
    // db.query('INSERT INTO windsurfStatistics.statistics SET ?', submittedData, (err, result) => {
    //   if (err) {
    //     next(err)
    //   } else {
    //     res.redirect('statistics')
    //   }
    // })
  }
}

function showStatistics (req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)
      .then(result => {
        res.render('statistics', {
          page: 'Statistics',
          loginStatus: req.session.user,
          statistics: result
        })
      })
      .catch(err => console.error(err))
  }
}

function renderPreferences (req, res, next) {
  query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id)
    .then(result => {
      let prefs = result[0]
      let formattedPrefs = {
        boards: [
          prefs.board0,
          prefs.board1,
          prefs.board2,
          prefs.board3,
          prefs.board4
        ],
        sails: [
          prefs.sail0,
          prefs.sail1,
          prefs.sail2,
          prefs.sail3,
          prefs.sail4,
          prefs.sail5,
          prefs.sail6,
          prefs.sail7,
          prefs.sail8,
          prefs.sail9
        ],
        spots: [
          prefs.spot0,
          prefs.spot1,
          prefs.spot2,
          prefs.spot3,
          prefs.spot4
        ]
      }
      res.render('preferences', {
        page: 'Preferences',
        loginStatus: req.session.user,
        prefs: formattedPrefs
      })
    })
    .catch(err => console.error(err))
}

function preferences (req, res, next) {
  let prefsQuery
  if (req.originalUrl === '/set-prefs') {
    prefsQuery = 'INSERT INTO windsurfStatistics.preferences SET ?'
  } else {
    prefsQuery = `UPDATE windsurfStatistics.preferences SET ? WHERE userId = ${req.session.user.id}`
  }
  let prefData = {
    boards: [
      req.body.board0.trim(),
      req.body.board1.trim(),
      req.body.board2.trim(),
      req.body.board3.trim(),
      req.body.board4.trim()
    ],
    sails: [
      req.body.sail0,
      req.body.sail1,
      req.body.sail2,
      req.body.sail3,
      req.body.sail4,
      req.body.sail5,
      req.body.sail6,
      req.body.sail7,
      req.body.sail8,
      req.body.sail9
    ],
    spots: [
      req.body.spot0,
      req.body.spot1,
      req.body.spot2,
      req.body.spot3,
      req.body.spot4
      // Spot names?
    ]
  }

  prefData.spots.forEach((spot, i) => {
    if (!spot.includes('windfinder')) {
      prefData.spots[i] = ''
    }
  })

  query(prefsQuery, {
    userId: req.session.user.id,
    board0: prefData.boards[0],
    board1: prefData.boards[1],
    board2: prefData.boards[2],
    board3: prefData.boards[3],
    board4: prefData.boards[4],
    sail0: prefData.sails[0],
    sail1: prefData.sails[1],
    sail2: prefData.sails[2],
    sail3: prefData.sails[3],
    sail4: prefData.sails[4],
    sail5: prefData.sails[5],
    sail6: prefData.sails[6],
    sail7: prefData.sails[7],
    sail8: prefData.sails[8],
    sail9: prefData.sails[9],
    spot0: prefData.spots[0],
    spot1: prefData.spots[1],
    spot2: prefData.spots[2],
    spot3: prefData.spots[3],
    spot4: prefData.spots[4]
  })
    .then(result => res.redirect('/statistics'))
    .catch(err => { throw err })
}

function register (req, res, next) {
  var username = req.body.username
  var email = req.body.email
  var password = req.body.password

  if (!username || !email || !password) {
    res.status(400).send('Name, e-mail or password are missing!')
  }

  bcrypt.hash(password, options.saltRounds)
    .then(hash => {
      db.query('INSERT INTO windsurfStatistics.users SET ?', {
        username: username,
        email: email,
        password: hash
      }, (err, data) => {
        if (err) next(err)
        db.query('SELECT id FROM windsurfStatistics.users WHERE email = ?', email, (err, result) => {
          if (err) next(err)
          var userId = result[0].id

          req.session.user = {
            name: username,
            email: email,
            id: userId
          }

          res.render('setPrefs', {
            page: 'Preferences',
            loginStatus: req.session.user
          })
        })
      })
    })
    .catch(err => console.error(err))
}

function login (req, res, next) {
  var email = req.body.email
  var password = req.body.password

  if (!email || !password) {
    res.status(400).send('Username or password is missing!')
  }

  query('SELECT * FROM windsurfStatistics.users WHERE email = ?', email)
    .then(data => {
      let user = data && data[0]
      if (user) {
        return bcrypt.compare(password, user.password).then(onverify, next)
      } else {
        res.status(401).render('error', {
          page: 'Error',
          error: 'E-mail does not exist.'
        })
      }

      function onverify (match) {
        if (match) {
          req.session.user = {
            name: user.username,
            email: email,
            id: user.id
          }

          res.redirect('/')
        } else {
          res.status(401).render('error', {
            page: 'Error',
            error: 'Incorrect password.'
          })
        }
      }
    })
    .catch(err => console.error(err))
}

function logout (req, res) {
  req.session.destroy(err => {
    if (err) throw err
    res.redirect('/')
  })
}

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
