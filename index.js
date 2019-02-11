const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const helmet = require('helmet')
const db = require('./modules/db')
const scrape = require('wind-scrape')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const user = require('./modules/user')
const helper = require('./modules/helper')
const config = require('./app-config.json')
const lang = helper.localize(config.language)

require('dotenv').config()

db.init()

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
  .post('/set-prefs', user.preferences)
  .post('/update-prefs', user.preferences)
  .get('/account', user.getAccountDetails)
  .post('/update-email', user.updateEmail)
  .get('/login', render)
  .post('/sign-up', user.register)
  .post('/sign-in', user.login)
  .get('/sign-out', user.logout)
  .post('/submit-data', submitData)
  .post('/confirm-submit', confirmedData)
  .use(notFound)
  .listen(config.port, () => console.log(chalk.green(`[Server] listening on port ${config.port}...`)))

function render (req, res) {
  let id = req.originalUrl.replace('/', '')

  if (id === 'register' && config.allowRegister === false) {
    res.redirect('/')
    return
  }

  if ((id === 'login' || id === 'register') && !req.session.user) {
    res.render(id, {
      page: id.charAt(0).toUpperCase() + id.substr(1),
      loginStatus: req.session.user,
      lang: lang,
      config: config
    })
    return
  }

  if (!req.session.user) {
    res.redirect('login')
    return
  }

  if ((id === 'login' || id === 'register') && req.session.user !== undefined) {
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
  db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id)
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

    let responses = {
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
  let checkCorrect = req.body.confirmData

  let submittedData = {
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
    db.query('INSERT INTO windsurfStatistics.statistics SET ?', submittedData)
      .then(res.redirect('statistics'))
      .catch(err => console.log(err))
  }
}

function showAllStatistics (req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)
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
    db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)
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
  db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id)
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

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: lang.error._404,
    lang: lang
  })
}
