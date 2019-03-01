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

async function addSession (req, res) {
  try {
    const result = await db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id)
    const preferences = result[0]
    const formattedPrefs = {
      boards: [
        preferences.board0,
        preferences.board1,
        preferences.board2,
        preferences.board3,
        preferences.board4
      ],
      sails: [
        preferences.sail0,
        preferences.sail1,
        preferences.sail2,
        preferences.sail3,
        preferences.sail4,
        preferences.sail5,
        preferences.sail6,
        preferences.sail7,
        preferences.sail8,
        preferences.sail9
      ],
      spots: [
        preferences.spot0,
        preferences.spot1,
        preferences.spot2,
        preferences.spot3,
        preferences.spot4
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
  } catch (err) {
    console.error(err)
  }
}

async function allStatistics (req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
    return
  }

  try {
    const sessions = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)

    res.render('statistics-table', {
      page: lang.page.statistics.name,
      loginStatus: req.session.user,
      statistics: sessions,
      lang: lang,
      config: config
    })
  } catch (err) {
    console.error(err)
  }
}

async function preferences (req, res, next) {
  try {
    const result = await db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id)
    const preferences = result[0]
    let formattedPrefs = {
      boards: [
        preferences.board0,
        preferences.board1,
        preferences.board2,
        preferences.board3,
        preferences.board4
      ],
      sails: [
        preferences.sail0,
        preferences.sail1,
        preferences.sail2,
        preferences.sail3,
        preferences.sail4,
        preferences.sail5,
        preferences.sail6,
        preferences.sail7,
        preferences.sail8,
        preferences.sail9
      ],
      spots: [
        preferences.spot0,
        preferences.spot1,
        preferences.spot2,
        preferences.spot3,
        preferences.spot4
      ]
    }

    res.render('preferences', {
      page: lang.page.preferences.name,
      loginStatus: req.session.user,
      prefs: formattedPrefs,
      lang: lang,
      config: config
    })
  } catch (err) {
    console.error(err)
  }
}

async function account (req, res) {
  if (!req.session.user) {
    res.redirect('/login')
    return
  }

  try {
    const userData = await db.query('SELECT * FROM windsurfStatistics.users WHERE id = ?', req.session.user.id)

    res.render('account', {
      page: lang.page.account.name,
      loginStatus: req.session.user,
      userData: userData[0],
      lang: lang,
      config: config
    })
  } catch (err) {
    console.error(err)
  }
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
  account,
  notFound
}
