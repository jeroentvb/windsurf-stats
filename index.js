const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const request = require('request')
const mysql = require('mysql')
const cheerio = require('cheerio')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const fs = require('fs')
const tools = require('./modules/tools')
const options = require('./modules/options')

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

module.exports = express()
  // .get('/setupDb', setupDb)

  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .use(bodyParser.urlencoded({extended: true}))
  .use(session({
    store: new FileStore,
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
  }))
  .get('/', showStatistics)
  .get('/statistics', showStatistics)
  .get('/add-session', addSession)
  .get('/register', render)
  .get('/preferences', renderIfLoggedIn)
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


function render(req, res, needLogin) {
  var id = req.originalUrl.replace('/', '')

  res.render(id, {
    page: id.charAt(0).toUpperCase() + id.substr(1),
    loginStatus: req.session.user
  })
}

function renderIfLoggedIn(req, res) {
  if (req.session.user == undefined) {
    needLogin(req, res)
  } else {
    var id = req.originalUrl.replace('/', '')

    res.render(id, {
      page: (id.charAt(0).toUpperCase() + id.substr(1)).replace('-', ' '),
      loginStatus: req.session.user
    })
  }
}

function addSession(req, res, next) {
  db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id, function (err, result) {
    var prefs = result[0]
    var formattedPrefs = {
      boards: [
        prefs.board0,
        prefs.board1,
        prefs.board2,
        prefs.board3,
        prefs.board4,
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
        prefs.spot4,
      ]
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

function submitData(req, res) {
  console.log(chalk.yellow(`Recieved data submission from user ${req.session.user.name}`))

  var date = req.body.date
  var time = req.body.time
  var spot = req.body.spot

  var submittedData = {
    sail: req.body.sailSize,
    board: req.body.windsurfBoard,
    rating: req.body.rating,
    note: req.body.note
  }

  if (date == 'today') {
    submittedData.date = tools.getToday()

    var windfinder = {
      time: new Array,
      windspeed: new Array,
      windgust: new Array,
      windDirection: new Array
    }

    var responses = {
      spot: '',
      time: '',
      windspeed: Number,
      windgust: Number,
      windDirection: '',
      index: Number
    }

    request(options.spotUrls[spot], function(error, response, html) {
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
        tools.spliceToFirstDay(windfinder.time)

        // Get the average wind speed
        $('.data--major').find($('.units-ws')).filter(function(i) {
          windfinder.windspeed[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.windspeed)

        // Get the wind gusts
        $('.data-gusts').find($('.units-ws')).filter(function(i) {
          windfinder.windgust[i] = $(this).text()
        })
        tools.spliceToFirstDay(windfinder.windgust)

        // Get the wind direction; do some converting
        $('.data-direction-arrow').find($('.directionarrow')).filter(function(i) {
          var data = parseInt($(this).attr('title').replace('°', ' '))// - 180
          // This can be used to calculate the wind direction in wind direction instead of angles
          var val = Math.floor((data / 22.5) + 0.5)
          var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
          windfinder.windDirection[i] = windDirections[(val % 16)]
          // windfinder.windDirection[i] = data
        })
        tools.spliceToFirstDay(windfinder.windDirection)

        // Gather all the data that's going to be used
        responses.windspeed =  Math.max(...windfinder.windspeed)
        responses.index = windfinder.windspeed.findIndex(function(el) {
          return el == responses.windspeed
        })
        responses.time = windfinder.time[responses.index]
        responses.windgust = windfinder.windgust[responses.index]
        responses.windDirection = windfinder.windDirection[responses.index]

        // exportData('windfinder', windfinder)
        // exportData('responses', responses)

        var allData = {...submittedData, ...responses}
        // tools.exportObj('all', allData)

        req.session.user.data = allData

        res.render('confirm-data', {
          page: 'Confirm submission',
          data: allData,
          loginStatus: req.session.user
        })
      }
    })
  } else {
    // Do stuff with the date & data that was submitted manually
  }
}

function confirmedData(req, res, next) {
  var checkCorrect = req.body.confirmData

  if (checkCorrect == 'incorrect') {
    req.session.user.data = {}
    res.redirect('/')
  } else {
    if (req.session.user.data.board != null) {
      db.query('INSERT INTO windsurfStatistics.statistics SET ?', {
        userId: req.session.user.id,
        date: req.session.user.data.date,
        spot: req.session.user.data.spot,
        windspeed: req.session.user.data.windspeed,
        windgust: req.session.user.data.windgust,
        windDirection: req.session.user.data.windDirection,
        sailSize: req.session.user.data.sail,
        board: req.session.user.data.board,
        rating: req.session.user.data.rating,
        note: req.session.user.data.note
      }, function (err, result) {
        if (err) {
          next(err)
        } else {
          req.session.user.data = {}

          res.redirect('statistics')
        }
      })
    } else {
      req.session.user
      res.render('submit-stats', {
        page: 'Submit stats',
        loginStatus: req.session.user
      })
    }
  }
}

function showStatistics(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id, function (err, result) {
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

function updatePreferences(req, res, next) {
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
  }, function (err, result) {
    if (err) {
      throw err
    } else {
      res.redirect('/statistics')
    }
  })
}

function setPreferences(req, res, next) {
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
  }, function (err, result) {
    if (err) {
      throw err
    } else {
      res.redirect('/statistics')
    }
  })
}

function register(req, res, next) {
  var username = req.body.username
  var email = req.body.email
  var password = req.body.password

  if (!username || !email || !password) {
    res.status(400).send('Name, e-mail or password are missing!')
  }

  bcrypt.hash(password, options.saltRounds, function (err, hash) {
    if (err) {
      throw err
    } else {
      db.query('INSERT INTO windsurfStatistics.users SET ?', {
        username: username,
        email: email,
        password: hash
      }, function (err, data) {
        if (err) {
          next(err)
        } else {
          db.query('SELECT id FROM windsurfStatistics.users WHERE email = ?', email, function (err, result) {
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

function login(req, res, next) {
  var email = req.body.email
  var password = req.body.password

  if (!email || !password) {
    res.status(400).send('Username or password is missing!')
  }

  db.query('SELECT * FROM windsurfStatistics.users WHERE email = ?', email, function(err, data) {
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

    function onverify(match) {
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

function logout(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      next(err)
    } else {
      res.redirect('/')
    }
  })
}

function needLogin(req, res) {
  res.status(401).render('error', {
    page: 'Error 401',
    error: 'You need to log in to view this page.'
  })
}

function notFound(req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}

// Set up the database
// function setupDb (req, res) {
//   db.query('CREATE DATABASE IF NOT EXISTS windsurfStatistics', function (err, result) {
//     if(err){
//       throw err
//     } else {
//       console.log(chalk.yellow('[MySql] Database created'))
//
//       db.query(`CREATE TABLE IF NOT EXISTS windsurfStatistics.statistics(statisticId int NOT NULL AUTO_INCREMENT,
//         userId INT, date VARCHAR(10), spot VARCHAR(100), windspeed INT, windgust INT, windDirection VARCHAR(30),
//         sailSize FLOAT, board VARCHAR(30), rating FLOAT, note VARCHAR(255), PRIMARY KEY (statisticId))`, function(err, result) {
//         if(err) {
//           throw err
//         } else {
//           console.log(chalk.yellow('[MySql] Statistics table created'))
//
//           db.query(`CREATE TABLE IF NOT EXISTS windsurfStatistics.users(id int NOT NULL AUTO_INCREMENT,
//             username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id)) `, function(err, result) {
//             if(err) {
//               throw err
//             } else {
//               console.log(chalk.yellow('[MySql] Users table created'))
//
//               db.query(`CREATE TABLE IF NOT EXISTS windsurfStatistics.preferences(id int NOT NULL AUTO_INCREMENT, userId INT,
//                 board0 VARCHAR(255), board1 VARCHAR(255), board2 VARCHAR(255), board3 VARCHAR(255), board4 VARCHAR(255),
//                 sail0 VARCHAR(255), sail1 VARCHAR(255), sail2 VARCHAR(255), sail3 VARCHAR(255), sail4 VARCHAR(255),
//                 sail5 VARCHAR(255), sail6 VARCHAR(255), sail7 VARCHAR(255), sail8 VARCHAR(255), sail9 VARCHAR(255),
//                 spot0 VARCHAR(255), spot1 VARCHAR(255), spot2 VARCHAR(255), spot3 VARCHAR(255), spot4 VARCHAR(255),
//                 PRIMARY KEY(id))`, function (err, result) {
//                 if (err) {
//                   throw err
//                 } else {
//
//                   console.log(chalk.yellow('[MySql] Preferences table created'))
//
//                   console.log(chalk.green('[MySql] Database set up succesfully'))
//
//                   res.send('Tables created succesfully')
//                 }
//               })
//             }
//           })
//         }
//       })
//     }
//   })
// }
