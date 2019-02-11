const db = require('./db')
const helper = require('./helper')
const config = require('../app-config.json')
const lang = helper.localize(config.language)

function page (req, res) {
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

function allStatistics (req, res, next) {
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

function preferences (req, res, next) {
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

module.exports = {
  page,
  addSession,
  allStatistics,
  preferences,
  notFound
}
