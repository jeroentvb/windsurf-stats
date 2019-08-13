const bcrypt = require('bcrypt')
const db = require('./db')
const render = require('./render')
const helper = require('./helper')
const scrape = require('wind-scrape')

function checkLogin (req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    next()
  }
}

async function register (req, res) {
  const user = {
    name: req.body.username,
    email: req.body.email,
    password: req.body.password
  }

  if (!user.name || !user.email || !user.password) {
    res.status(400).render('error', {
      page: 'Error 400',
      msg: 'Name, e-mail or password are missing!'
    })

    return
  }

  try {
    const userData = await db.query('SELECT * from windsurfStatistics.users WHERE email = ? OR username = ?', [
      user.email,
      user.name
    ])

    if (userData.length > 0) {
      res.render('error', {
        page: 'Error',
        msg: 'Username or e-mail already exists'
      })

      return
    }

    const userId = await db.createUser(user)

    req.session.user = {
      name: user.name,
      email: user.email,
      id: userId
    }

    res.render('set-gear', {
      page: 'Set gear'
    })
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

async function set (req, res) {
  const gear = {
    boards: req.body.board.map(board => board.trim()),
    sails: req.body.sail.map(sail => sail.trim()),
    spots: req.body.spot.map(spot => spot.trim())
  }

  try {
    await db.query('INSERT INTO windsurfStatistics.gear SET ?', {
      userId: req.session.user.id,
      board0: gear.boards[0],
      board1: gear.boards[1],
      board2: gear.boards[2],
      board3: gear.boards[3],
      board4: gear.boards[4],
      sail0: gear.sails[0],
      sail1: gear.sails[1],
      sail2: gear.sails[2],
      sail3: gear.sails[3],
      sail4: gear.sails[4],
      sail5: gear.sails[5],
      sail6: gear.sails[6],
      sail7: gear.sails[7],
      sail8: gear.sails[8],
      sail9: gear.sails[9],
      spot0: gear.spots[0],
      spot1: gear.spots[1],
      spot2: gear.spots[2],
      spot3: gear.spots[3],
      spot4: gear.spots[4]
    })

    res.redirect('/statistics')
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

async function update (req, res) {
  const gear = {
    boards: req.body.board.map(board => board.trim()),
    sails: req.body.sail.map(sail => sail.trim()),
    spots: req.body.spot.map(spot => spot.trim())
  }

  try {
    await db.query('UPDATE windsurfStatistics.gear SET ? WHERE userId = ?', [
      {
        board0: gear.boards[0],
        board1: gear.boards[1],
        board2: gear.boards[2],
        board3: gear.boards[3],
        board4: gear.boards[4],
        sail0: gear.sails[0],
        sail1: gear.sails[1],
        sail2: gear.sails[2],
        sail3: gear.sails[3],
        sail4: gear.sails[4],
        sail5: gear.sails[5],
        sail6: gear.sails[6],
        sail7: gear.sails[7],
        sail8: gear.sails[8],
        sail9: gear.sails[9],
        spot0: gear.spots[0],
        spot1: gear.spots[1],
        spot2: gear.spots[2],
        spot3: gear.spots[3],
        spot4: gear.spots[4]
      },
      req.session.user.id
    ])

    res.redirect('/statistics')
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

async function login (req, res) {
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) {
    res.status(400).render('error', {
      page: 'Error 400',
      msg: 'Username or password is missing!'
    })
    return
  }

  try {
    const userData = await db.query('SELECT * FROM windsurfStatistics.users WHERE username = ?', username)
    const user = userData && userData[0]

    if (!user) {
      res.status(401).render('error', {
        page: 'Error',
        msg: 'Incorrect e-mail or password.'
      })
      return
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      res.status(401).render('error', {
        page: 'Error',
        msg: 'Incorrect password.'
      })
      return
    }

    req.session.user = {
      name: user.username,
      id: user.id,
      email: user.email
    }

    res.redirect('/')
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

function logout (req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error(err)
      render.unexpectedError(res)

      return
    }

    res.redirect('/login')
  })
}

async function submit (req, res) {
  const date = req.body.date

  if (date === 'today') {
    let session = {
      sailedHour: parseInt(req.body.hour),
      spot: req.body.spotOther ? req.body.spotOther : req.body.spot,
      sail: req.body.sailOther ? req.body.sailOther : req.body.sail,
      board: req.body.boardOther ? req.body.boardOther : req.body.board,
      rating: req.body.rating,
      note: req.body.note,
      date: helper.getToday()
    }

    try {
      const forecast = await scrape.windfinder(session.spot)
      let windData = forecast.days[0].hours.filter(hour => hour.hour === session.sailedHour)
      windData[0].winddirection = helper.getWindDirection(windData[0].winddirection)
      session.spot = forecast.spot

      const sessionData = {
        ...session,
        ...windData[0],
        windfinderLink: `https://www.windfinder.com/weatherforecast/${session.spot}`
      }

      res.render('confirm-session', {
        page: 'Confirm session data',
        session: sessionData
      })
    } catch (err) {
      if (err.message === 'The provided windfinder spot doesn\'t exist..') {
        res.status(400).render('error', {
          page: 'Error',
          msg: 'The entered windfinder spot doesn\'t exist'
        })

        return
      }

      console.error(err)
      render.unexpectedError(res)
    }
  } else {
    let session = {
      spot: req.body.spotOther ? req.body.spotOther : req.body.spot,
      sail: req.body.sailOther ? req.body.sailOther : req.body.sail,
      board: req.body.boardOther ? req.body.boardOther : req.body.board,
      rating: req.body.rating,
      note: req.body.note,
      date: req.body.dateInput,
      windspeed: req.body.windspeed,
      windgust: req.body.windgust,
      winddirection: req.body.winddirection
    }

    try {
      const forecast = await scrape.windfinder(session.spot)
      session.spot = forecast.spot

      res.render('confirm-session', {
        page: 'Confirm session data',
        session: session
      })
    } catch (err) {
      if (err.message === 'The provided windfinder spot doesn\'t exist..') {
        res.status(400).render('error', {
          page: 'Error',
          msg: 'The entered windfinder spot doesn\'t exist'
        })

        return
      }

      console.error(err)
      render.unexpectedError(res)
    }
  }
}

async function confirm (req, res) {
  const session = {
    userId: req.session.user.id,
    date: req.body.date,
    spot: req.body.spot,
    windspeed: req.body.windspeed,
    windgust: req.body.windgust,
    windDirection: req.body.winddirection,
    sailSize: req.body.sail,
    board: req.body.board,
    rating: req.body.rating,
    note: req.body.note
  }

  try {
    await db.query('INSERT INTO windsurfStatistics.statistics SET ?', session)

    res.redirect('/statistics')
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

async function password (req, res) {
  const password = {
    old: req.body['old-password'],
    new: req.body['new-password'],
    confirm: req.body['confirm-password']
  }

  if (!password.old || !password.new || !password.confirm) {
    res.status(400).render('error', {
      page: 'Error',
      msg: 'Password is missing!'
    })
    return
  }

  if (password.new !== password.confirm) {
    res.status(400).render('error', {
      page: 'Error',
      msg: 'New password and repeat new password didn\'t match.'
    })
    return
  }

  if (password.new === password.old) {
    res.status(400).render('error', {
      page: 'Error',
      msg: 'Old and new password can\'t be the same'
    })
    return
  }

  try {
    const userData = await db.query('SELECT password FROM windsurfStatistics.users WHERE id = ?', req.session.user.id)

    const match = await bcrypt.compare(password.old, userData[0].password)
    if (!match) {
      res.status(401).render('error', {
        page: 'Error',
        msg: 'Old password is incorrect'
      })
      return
    }

    const hash = await helper.hashPassword(password.new)
    await db.query(`UPDATE windsurfStatistics.users SET password = ? WHERE id = ?`, [
      hash,
      req.session.user.id
    ])

    res.redirect('/sign-out')
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

async function email (req, res) {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  if (!user.email || !user.password) {
    res.status(400).render('error', {
      page: 'Error',
      msg: 'E-mail or password is missing!'
    })
    return
  }

  try {
    const userData = await db.query('SELECT password FROM windsurfStatistics.users WHERE id = ?', req.session.user.id)

    const match = await bcrypt.compare(user.password, userData[0].password)

    if (!match) {
      res.status(401).render('error', {
        page: 'Error',
        msg: 'Incorrect password'
      })
      return
    }

    await db.query('UPDATE windsurfStatistics.users SET email = ? WHERE id = ?', [
      user.email,
      req.session.user.id
    ])
    req.session.user.email = user.email

    res.redirect('/account')
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

async function remove (req, res) {

}

module.exports = {
  checkLogin,
  register,
  gear: {
    set,
    update
  },
  login,
  logout,
  session: {
    submit,
    confirm
  },
  change: {
    password,
    email
  },
  remove
}
