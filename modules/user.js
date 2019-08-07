const bcrypt = require('bcrypt')
const db = require('./db')
const render = require('./render')

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

async function setGear (req, res) {
  const gear = {
    boards: req.body.board.map(board => board.trim()),
    sails: req.body.sail.map(sail => sail.trim()),
    spots: req.body.spot.map(spot => spot.trim())
  }

  try {
    await db.query('INSERT INTO windsurfStatistics.preferences SET ?', {
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
      id: user.id
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

module.exports = {
  register,
  setGear,
  login,
  logout
}
