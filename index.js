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
  // .get('/createdb', setupDb)

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
  .get('/', index)
  .get('/statistics', showStatistics)
  .get('/register', render)
  .get('/login', render)
  .post('/sign-up', register)
  .post('/sign-in', login)
  .get('/sign-out', logout)
  .post('/submit-data', submitData)
  .post('/confirm-submit', confirmedData)
  .use(notFound)
  .listen(options.port, () => console.log(chalk.green(`[Server] listening on port ${options.port}...`)))

function index(req, res) {
  res.render('submit-stats', {
    page: 'Home',
    loginStatus: req.session.user
  })
}

function render(req, res) {
  var id = req.originalUrl.replace('/', '')

  res.render(id, {
    page: id.charAt(0).toUpperCase() + id.substr(1),
    loginStatus: req.session.user
  })
}

function submitData(req, res) {
  console.log(chalk.yellow('Recieved data submission'))

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

    var spotUrls = {
      schellinkhout: 'https://www.windfinder.com/weatherforecast/markermeer_schellinkhout',
      hondehemeltje: 'https://www.windfinder.com/weatherforecast/broekerhaven',
      andijk: 'https://www.windfinder.com/weatherforecast/jachthaven-stichting-andijk',
    }

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
        // exportData('all', allData)

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
    // create a query to store data in the db
    db.query('SELECT id FROM windsurfStatistics.users WHERE email = ?', req.session.user.email, function (err, result) {
      if (err) {
        next(err)
      } else {
        var userId = result[0].id
        if (req.session.user.data.board != null) {
          db.query('INSERT INTO windsurfStatistics.statistics SET ?', {
            userId: userId,
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
    })
  }
}

function showStatistics(req, res, next) {
  if (!req.session.user) {
    needLogin(req, res)
  } else {
    db.query('SELECT id FROM windsurfStatistics.users WHERE email = ?', req.session.user.email, function (err, result) {
      if (err) {
        next(err)
      } else {
        var userId = result[0].id

        db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', userId, function (err, result) {
          if (err) {
            throw err
          } else {
            res.render('statistics', {
              page: 'Statistics',
              loginStatus: req.session.user,
              statistics: tools.objToStr(result)
            })
          }
        })
      }
    })
  }
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
          req.session.user = {
            name: username,
            email: email
          }

          res.redirect('/')
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
          email:email
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
//   db.query('CREATE DATABASE IF NOT EXISTS windsurfStatistics', function(err, result) {
//     if(err){
//       throw err
//     } else {
//       console.log(chalk.yellow('[MySql] Database created'))
//
//       db.query('CREATE TABLE IF NOT EXISTS windsurfStatistics.statistics(statisticId int NOT NULL AUTO_INCREMENT, userID INT, date VARCHAR(10), spot VARCHAR(100), windspeed INT, windgust INT, windDirection VARCHAR(30), sailSize FLOAT, board VARCHAR(30), rating FLOAT, note VARCHAR(255), PRIMARY KEY (statisticId))', function(err, result) {
//         if(err) {
//           throw err
//         } else {
//           console.log(chalk.yellow('[MySql] Statistics table created'))
//
//           db.query('CREATE TABLE IF NOT EXISTS windsurfStatistics.users(id int NOT NULL AUTO_INCREMENT, username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id))', function(err, result) {
//             if(err) {
//               throw err
//             } else {
//               console.log(chalk.yellow('[MySql] Users table created'))
//
//               console.log(chalk.green('[MySql] Database set up succesfully'))
//
//               res.send('Tables created succesfully')
//             }
//           })
//         }
//       })
//     }
//   })
// }
