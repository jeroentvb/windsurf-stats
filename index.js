const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const helmet = require('helmet')
const mysql = require('mysql')
const scrape = require('wind-scrape')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const helper = require('./modules/helper')
const config = require('./app-config.json')
const lang = helper.localize(config.language)

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
  console.log(chalk.green('[MySql] trying to connect..'))
  db = mysql.createConnection(dbConfig)
  // connect to db
  db.connect(err => {
    if (err) {
      console.error('[MySql] error while connecting to the db:', err)
      setTimeout(handleDisconnect, 10000)
    } else {
      console.log(chalk.green('[MySql] connection established..'))
    }
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

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(helmet())
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
      maxAge: config.cookieMaxAge
    }
  }))
  .get('/', render)
  .get('/statistics', render)
  .get('/all-stats', showAllStatistics)
  .get('/data', sendData)
  .get('/add-session', addSession)
  .get('/register', render)
  .get('/preferences', renderPreferences)
  .post('/set-prefs', preferences)
  .post('/update-prefs', preferences)
  .get('/account', getAccountDetails)
  .post('/update-email', updateEmail)
  .get('/login', render)
  .post('/sign-up', register)
  .post('/sign-in', login)
  .get('/sign-out', logout)
  .post('/submit-data', submitData)
  .post('/confirm-submit', confirmedData)
  .use(notFound)
  .listen(config.port, () => console.log(chalk.green(`[Server] listening on port ${config.port}...`)))

function render (req, res) {
  var id = req.originalUrl.replace('/', '')

  if (!req.session.user) {
    res.render('login', {
      page: 'Login',
      loginStatus: req.session.user,
      lang: lang,
      config: config
    })
    return
  }

  if (id === 'register' && config.allowRegister === false) {
    res.redirect('/')
    return
  }

  if (id === '') {
    res.render('statistics', {
      page: lang.page.statistics.name,
      loginStatus: req.session.user,
      lang: lang,
      config: config
    })
  } else {
    res.render(id, {
      page: id.charAt(0).toUpperCase() + id.substr(1),
      loginStatus: req.session.user,
      lang: lang,
      config: config
    })
  }
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
        date: helper.getYesterday()
      }

      res.render('add-session', {
        page: lang.page.add_session.name,
        loginStatus: req.session.user,
        prefs: formattedPrefs,
        lang: lang,
        config: config
      })
    })
    .catch(err => console.error(err))
}

function submitData (req, res) {
  let date = req.body.date

  let submittedData = {
    spot: req.body.spotOther ? req.body.spotOther : req.body.spot,
    sail: req.body.sailSizeOther ? req.body.sailSizeOther : req.body.sailSize,
    board: req.body.windsurfBoardOther ? req.body.windsurfBoardOther : req.body.windsurfBoard,
    rating: req.body.rating,
    note: req.body.note
  }

  if (date === 'today') {
    submittedData.date = helper.getToday()

    var responses = {
      spot: '',
      time: '',
      windspeed: Number,
      windgust: Number,
      windDirection: '',
      index: Number
    }

    scrape.windfinder(submittedData.spot)
      .then(windfinder => {
        helper.spliceToFirstDay(windfinder.windspeed)
        helper.spliceToFirstDay(windfinder.time)
        helper.spliceToFirstDay(windfinder.windgust)
        helper.spliceToFirstDay(windfinder.winddirection)

        return windfinder
      })
      .then(windfinder => {
        responses.spot = windfinder.spot
        responses.windspeed = Math.max(...windfinder.windspeed)
        responses.index = windfinder.windspeed.findIndex(() => responses.windspeed)
        responses.time = windfinder.time[responses.index]
        responses.windgust = windfinder.windgust[responses.index]

        windfinder.winddirection.forEach((direction, index) => {
          windfinder.winddirection[index] = helper.getWindDirection(direction, lang.wind_directions)
        })
        responses.windDirection = windfinder.winddirection[responses.index]

        let allData = {
          ...submittedData,
          ...responses,
          windfinderLink: `https://www.windfinder.com/forecast/${submittedData.spot}`
        }

        return allData
      })
      .then(allData => {
        res.render('confirm-data', {
          page: lang.page.confirm_submission.name,
          data: allData,
          loginStatus: req.session.user,
          lang: lang,
          config: config
        })
      })
      .catch(err => {
        res.render('error', {
          page: 'error',
          error: err,
          lang: lang,
          config: config
        })
        console.error(err)
      })
  } else {
    let additionalData = {
      date: req.body.dateInput,
      windspeed: req.body.windspeed,
      windgust: req.body.windgust,
      windDirection: req.body.windDirection
    }

    let manualData = {
      ...submittedData,
      ...additionalData
    }

    scrape.windfinder(submittedData.spot)
      .then(res => {
        manualData.spot = res.spot
        return manualData
      })
      .then(manualData => res.render('confirm-data', {
        page: lang.page.confirm_submission.name,
        data: manualData,
        loginStatus: req.session.user,
        lang: lang,
        config: config
      }))
      .catch(err => console.error(err))
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
  }
}

function showAllStatistics (req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)
      .then(result => {
        res.render('statistics-table', {
          page: lang.page.statistics.name,
          loginStatus: req.session.user,
          statistics: result,
          lang: lang,
          config: config
        })
      })
      .catch(err => console.error(err))
  }
}

function sendData (req, res) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)
      .then(result => {
        let data = []
        result.forEach(session => {
          data.push({
            date: session.date,
            spot: session.spot,
            windspeed: session.windspeed,
            windgust: session.windgust,
            windDirection: session.windDirection,
            sailSize: session.sailSize,
            board: session.board,
            rating: session.rating,
            note: session.note
          })
        })
        return data
      })
      .then(data => res.json(data))
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
        page: lang.page.preferences.name,
        loginStatus: req.session.user,
        prefs: formattedPrefs,
        lang: lang,
        config: config
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
      req.body.spot0.trim(),
      req.body.spot1.trim(),
      req.body.spot2.trim(),
      req.body.spot3.trim(),
      req.body.spot4.trim()
    ]
  }

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
    .catch(err => console.error(err))
}

function getAccountDetails (req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else if (config.allowChangeEmail === false) {
    res.redirect('/statistics')
  } else {
    query('SELECT * FROM windsurfStatistics.users WHERE id = ?', req.session.user.id)
      .then(result => {
        res.render('account', {
          page: lang.page.account.name,
          loginStatus: req.session.user,
          userData: result[0],
          lang: lang,
          config: config
        })
      })
      .catch(err => console.error(err))
  }
}

function updateEmail (req, res, next) {
  let email = req.body.email
  let password = req.body.password

  if (!email || !password) {
    res.status(400).send('Username or password is missing!')
  }

  query('SELECT * FROM windsurfStatistics.users WHERE id = ?', req.session.user.id)
    .then(data => {
      let user = data && data[0]
      if (user) {
        return bcrypt.compare(password, user.password).then(onverify, next)
      } else {
        res.status(401).render('error', {
          page: 'Error',
          error: lang.error._401_email,
          lang: lang
        })
      }

      function onverify (match) {
        if (match) {
          query(`UPDATE windsurfStatistics.users SET email = ? WHERE id = ?`, [
            email,
            req.session.user.id
          ])
            .then(() => {
              req.session.user.email = email
              res.redirect('/account')
            })
            .catch(err => console.error(err))
        } else {
          res.status(401).render('error', {
            page: 'Error',
            error: lang.error._401_passwd,
            lang: lang
          })
        }
      }
    })
    .catch(err => console.error(err))
}

function register (req, res, next) {
  var username = req.body.username
  var email = req.body.email
  var password = req.body.password

  if (!username || !email || !password) {
    res.status(400).send('Name, e-mail or password are missing!')
  }

  bcrypt.hash(password, config.saltRounds)
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
            page: lang.page.preferences.name,
            loginStatus: req.session.user,
            lang: lang,
            config: config
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
          error: lang.error._401_email,
          lang: lang
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
            error: lang.error._401_passwd,
            lang: lang
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
    error: lang.error._404,
    lang: lang
  })
}
