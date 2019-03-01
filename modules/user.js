const bcrypt = require('bcrypt')
const db = require('./db')
const helper = require('./helper')
const config = require('../app-config.json')
const lang = helper.localize(config.language)

function hashPassword (password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, config.saltRounds, (err, hash) => {
      if (err) reject(err)
      resolve(hash)
    })
  })
}

async function preferences (req, res, next) {
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

  try {
    await db.query(prefsQuery, {
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
    res.redirect('/statistics')
  } catch (err) {
    console.error(err)
  }
}

async function updateEmail (req, res, next) {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    res.status(400).send('Username or password is missing!')
  }

  try {
    const userData = await db.query('SELECT * FROM windsurfStatistics.users WHERE id = ?', req.session.user.id)
    const user = userData && userData[0]

    if (!user) {
      res.status(401).render('error', {
        page: 'Error',
        error: lang.error._401_email,
        lang: lang
      })
      return
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      res.status(401).render('error', {
        page: 'Error',
        error: lang.error._401_passwd,
        lang: lang
      })
      return
    }

    await db.query(`UPDATE windsurfStatistics.users SET email = ? WHERE id = ?`, [
      email,
      req.session.user.id
    ])
    req.session.user.email = email

    res.redirect('/account')
  } catch (err) {
    console.error(err)
  }
}

async function changePassword (req, res, next) {
  const oldPassword = req.body.oldPassword
  const newPassword = req.body.newPassword

  if (!oldPassword || !newPassword) {
    res.status(400).send('Password is missing!')
    return
  }

  try {
    const userData = await db.query('SELECT * FROM windsurfStatistics.users WHERE id = ?', req.session.user.id)
    const user = userData && userData[0]

    if (!user) {
      res.status(401).render('error', {
        page: 'Error',
        error: lang.error._401_email,
        lang: lang
      })
      return
    }

    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match) {
      res.status(401).render('error', {
        page: 'Error',
        error: lang.error._401_passwd,
        lang: lang
      })
      return
    }

    const hash = await hashPassword(newPassword)
    await db.query(`UPDATE windsurfStatistics.users SET password = ? WHERE id = ?`, [
      hash,
      req.session.user.id
    ])

    res.redirect('/sign-out')
  } catch (err) {
    console.error(err)
  }
}

async function register (req, res, next) {
  const user = {
    name: req.body.username,
    email: req.body.email,
    password: req.body.password
  }

  if (!user.name || !user.email || !user.password) {
    res.status(400).send('Name, e-mail or password are missing!')
    return
  }

  try {
    const userData = await db.query('SELECT * from windsurfStatistics.users WHERE email = ?', user.email)
    if (userData.length > 0) {
      res.render('error', {
        page: 'Error',
        error: 'E-mail already exists',
        lang: lang
      })
    } else {
      storeInDb(req, res, user)
    }
  } catch (err) {
    console.error(err)
  }
}

async function storeInDb (req, res, user) {
  try {
    const hash = await hashPassword(user.password)
    await db.query('INSERT INTO windsurfStatistics.users SET ?', {
      username: user.name,
      email: user.email,
      password: hash
    })

    const userData = await db.query('SELECT id FROM windsurfStatistics.users WHERE email = ?', user.email)
    const userId = userData[0].id

    req.session.user = {
      name: user.name,
      email: user.email,
      id: userId
    }

    res.render('setPrefs', {
      page: lang.page.preferences.name,
      loginStatus: req.session.user,
      lang: lang,
      config: config
    })
  } catch (err) {
    console.error(err)
  }
}

async function login (req, res, next) {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    res.status(400).send('Username or password is missing!')
    return
  }

  try {
    const userData = await db.query('SELECT * FROM windsurfStatistics.users WHERE email = ?', email)
    const user = userData && userData[0]

    if (!user) {
      res.status(401).render('error', {
        page: 'Error',
        error: lang.error._401_email,
        lang: lang
      })
      return
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      res.status(401).render('error', {
        page: 'Error',
        error: lang.error._401_passwd,
        lang: lang
      })
      return
    }

    req.session.user = {
      name: user.username,
      email: email,
      id: user.id
    }

    res.redirect('/')
  } catch (err) {
    console.error(err)
  }
}

function logout (req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error(err)
      return
    }
    res.redirect('/')
  })
}

module.exports = {
  preferences,
  updateEmail,
  changePassword,
  register,
  login,
  logout
}
