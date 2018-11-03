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
var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})
// connect to db
db.connect(err => {
  if (err) {
    throw err
  } else {
    console.log(chalk.green('[MySql] connection established..'))
  }
})

module.exports = express()
  // .get('/setupDb', setupDb)

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
  .post('/set-prefs', setPreferences)
  .post('/update-prefs', updatePreferences)
  .get('/login', render)
  .post('/sign-up', register)
  .post('/sign-in', login)
  .get('/sign-out', logout)
  .post('/submit-data', submitData)
  .post('/confirm-submit', confirmedData)
  .use(notFound)
  .listen(options.port, () => console.log(chalk.green(`[Server] listening on port ${options.port}...`)))

function render (req, res, needLogin) {
  var id = req.originalUrl.replace('/', '')

  res.render(id, {
    page: id.charAt(0).toUpperCase() + id.substr(1),
    loginStatus: req.session.user
  })
}

// function renderIfLoggedIn (req, res) {
//   if (req.session.user == undefined) {
//     needLogin(req, res)
//   } else {
//     var id = req.originalUrl.replace('/', '')
//     res.render(id, {
//       page: (id.charAt(0).toUpperCase() + id.substr(1)).replace('-', ' '),
//       loginStatus: req.session.user
//     })
//   }
// }

function addSession (req, res, next) {
  db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id, (err, result) => {
    var prefs = result[0]
    var formattedPrefs = {
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

    if (err) {
      throw err
    } else {
      res.render('add-session', {
        page: 'Add session',
        loginStatus: req.session.user,
        prefs: formattedPrefs
      })
    }
  })
}

function submitData (req, res) {
  console.log(chalk.yellow(`Recieved data submission from user ${req.session.user.name}`))

  var date = req.body.date
  var spot = req.body.spot

  var submittedData = {
    sail: req.body.sailSize,
    board: req.body.windsurfBoard,
    rating: req.body.rating,
    note: req.body.note,
    date: req.body.dateInput,
    spot: req.body.spot,
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

    request(options.spotUrls[spot], (error, response, html) => {
      if (error) {
        res.render('error', {
          page: 'error',
          error: error
        })
        throw error
      } else {
        var $ = cheerio.load(html)

        // Get the spots name
        $('#spotheader-spotname').filter(() => {
          var spotName = $(this).text().split(' ')
          responses.spot = spotName[spotName.length - 1]
        })

        // Get the time
        $('.data-time').find($('.value')).filter((i) => {
          // console.log($(this).text())
          windfinder.time[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.time)

        // Get the average wind speed
        $('.data--major').find($('.units-ws')).filter((i) => {
          windfinder.windspeed[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.windspeed)

        // Get the wind gusts
        $('.data-gusts').find($('.units-ws')).filter((i) => {
          windfinder.windgust[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.windgust)

        // Get the wind direction; do some converting
        $('.data-direction-arrow').find($('.directionarrow')).filter((i) => {
          var data = parseInt($(this).attr('title').replace('°', ' '))// - 180
          // This can be used to calculate the wind direction in wind direction instead of angles
          var val = Math.floor((data / 22.5) + 0.5)
          var windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
          windfinder.windDirection[i] = windDirections[(val % 16)]
          // windfinder.windDirection[i] = data
        })
        tools.spliceToFirstDay(windfinder.windDirection)

        // Gather all the data that's going to be used
        responses.windspeed = Math.max(...windfinder.windspeed)
        responses.index = windfinder.windspeed.findIndex((el) => {
          return el === responses.windspeed
        })
        responses.time = windfinder.time[responses.index]
        responses.windgust = windfinder.windgust[responses.index]
        responses.windDirection = windfinder.windDirection[responses.index]

        // exportData('windfinder', windfinder)
        // exportData('responses', responses)

        var allData = {
          ...submittedData,
          ...responses
        }
        tools.exportObj('all', allData)

        res.render('confirm-data', {
          page: 'Confirm submission',
          data: allData,
          loginStatus: req.session.user
        })
      }
    })
  } else {
    res.render('confirm-data', {
      page: 'Confirm submission',
      data: submittedData,
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
    // req.session.user.data = {}
    res.redirect('/')
  } else {
    db.query('INSERT INTO windsurfStatistics.statistics SET ?', submittedData, (err, result) => {
      if (err) {
        next(err)
      } else {
        // req.session.user.data = {}

        res.redirect('statistics')
      }
    })
  }
}

function showStatistics (req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id, (err, result) => {
      if (err) {
        throw err
      } else {
        res.render('statistics', {
          page: 'Statistics',
          loginStatus: req.session.user,
          statistics: result
        })
      }
    })
  }
}

function renderPreferences (req, res, next) {
  db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id, (err, result) => {
    var prefs = result[0]
    var formattedPrefs = {
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

    if (err) {
      throw err
    } else {
      res.render('preferences', {
        page: 'Preferences',
        loginStatus: req.session.user,
        prefs: formattedPrefs
      })
    }
  })
}

function updatePreferences (req, res, next) {
  var prefData = {
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

  db.query(`UPDATE windsurfStatistics.preferences SET ? WHERE userId = ${req.session.user.id}`, {
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
  }, (err, result) => {
    if (err) {
      throw err
    } else {
      res.redirect('/statistics')
    }
  })
}

function setPreferences (req, res, next) {
  var prefData = {
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

  db.query(`INSERT INTO windsurfStatistics.preferences SET ? `, {
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
  }, (err, result) => {
    if (err) {
      throw err
    } else {
      res.redirect('/statistics')
    }
  })
}

function register (req, res, next) {
  var username = req.body.username
  var email = req.body.email
  var password = req.body.password

  if (!username || !email || !password) {
    res.status(400).send('Name, e-mail or password are missing!')
  }

  bcrypt.hash(password, options.saltRounds, (err, hash) => {
    if (err) {
      throw err
    } else {
      db.query('INSERT INTO windsurfStatistics.users SET ?', {
        username: username,
        email: email,
        password: hash
      }, (err, data) => {
        if (err) {
          next(err)
        } else {
          db.query('SELECT id FROM windsurfStatistics.users WHERE email = ?', email, (err, result) => {
            if (err) {
              next(err)
            } else {
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
            }
          })
        }
      })
    }
  })
}

function login (req, res, next) {
  var email = req.body.email
  var password = req.body.password

  if (!email || !password) {
    res.status(400).send('Username or password is missing!')
  }

  db.query('SELECT * FROM windsurfStatistics.users WHERE email = ?', email, (err, data) => {
    var user = data && data[0]

    if (err) {
      next(err)
    } else if (user) {
      bcrypt.compare(password, user.password).then(onverify, next)
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
}

function logout (req, res, next) {
  req.session.destroy(err => {
    if (err) {
      next(err)
    } else {
      res.redirect('/')
    }
  })
}

// function needLogin (req, res) {
//   res.status(401).render('error', {
//     page: 'Error 401',
//     error: 'You need to log in to view this page.'
//   })
// }

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}

// // Set up the database
// function setupDb (req, res) {
//   function createDb () {
//     return new Promise((resolve, reject) => {
//       db.query('CREATE DATABASE IF NOT EXISTS windsurfStatistics', (err, result) => {
//         if (err) {
//           reject(err)
//         } else {
//           console.log(chalk.yellow('[MySql] Database created'))
//           resolve()
//         }
//       })
//     })
//   }
//
//   function createTable (query, tableName) {
//     return new Promise((resolve, reject) => {
//       db.query(query, (err, result) => {
//         if (err) {
//           reject(err)
//         } else {
//           console.log(chalk.yellow(`[MySql] ${tableName} table created`))
//           resolve()
//         }
//       })
//     })
//   }
//
//   const queries = {
//     statistics: `CREATE TABLE IF NOT EXISTS windsurfStatistics.statistics(statisticId int NOT NULL AUTO_INCREMENT,
//       userId INT, date VARCHAR(10), spot VARCHAR(100), windspeed INT, windgust INT, windDirection VARCHAR(30),
//       sailSize FLOAT, board VARCHAR(30), rating FLOAT, note VARCHAR(255), PRIMARY KEY (statisticId))`,
//     users: `CREATE TABLE IF NOT EXISTS windsurfStatistics.users(id int NOT NULL AUTO_INCREMENT,
//       username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id))`,
//     prefs: `CREATE TABLE IF NOT EXISTS windsurfStatistics.preferences(id int NOT NULL AUTO_INCREMENT, userId INT,
//       board0 VARCHAR(255), board1 VARCHAR(255), board2 VARCHAR(255), board3 VARCHAR(255), board4 VARCHAR(255),
//       sail0 VARCHAR(255), sail1 VARCHAR(255), sail2 VARCHAR(255), sail3 VARCHAR(255), sail4 VARCHAR(255),
//       sail5 VARCHAR(255), sail6 VARCHAR(255), sail7 VARCHAR(255), sail8 VARCHAR(255), sail9 VARCHAR(255),
//       spot0 VARCHAR(255), spot1 VARCHAR(255), spot2 VARCHAR(255), spot3 VARCHAR(255), spot4 VARCHAR(255),
//       PRIMARY KEY(id))`
//   }
//
//   Promise.all([
//     createDb(),
//     createTable(queries.statistics, 'statistics'),
//     createTable(queries.users, 'users'),
//     createTable(queries.prefs, 'preferences')
//   ])
//     .then(() => {
//       console.log(chalk.green('[MySql] Database set up succesfully'))
//       res.send('Tables created succesfully')
//     })
//     .catch(err => {
//       console.error(err)
//       db.query('DROP DATABASE windsurfStatistics', (error, result) => {
//         if (error) {
//           console.log(chalk.red('Database could not be reset'))
//           throw error
//         } else {
//           console.log(chalk.yellow('Database was reset'))
//           res.send(`The database could not be set up because of the following error: \n ${err}`)
//         }
//       })
//     })
// }
