const db = require('./db')

function login (req, res) {
  res.render('login', {
    page: 'Login'
  })
}

function register (req, res) {
  res.render('register', {
    page: 'Register'
  })
}

function statistics (req, res) {
  res.render('statistics', {
    page: 'Statistics'
  })
}

async function gear (req, res) {
  try {
    const gear = await db.query('SELECT * FROM windsurfStatistics.preferences WHERE userId = ?', req.session.user.id)

    if (gear.length === 0) {
      res.render('set-gear', {
        page: 'Set gear'
      })

      return
    }

    const formattedGear = {
      boards: [
        gear[0].board0,
        gear[0].board1,
        gear[0].board2,
        gear[0].board3,
        gear[0].board4
      ],
      sails: [
        gear[0].sail0,
        gear[0].sail1,
        gear[0].sail2,
        gear[0].sail3,
        gear[0].sail4,
        gear[0].sail5,
        gear[0].sail6,
        gear[0].sail7,
        gear[0].sail8,
        gear[0].sail9
      ],
      spots: [
        gear[0].spot0,
        gear[0].spot1,
        gear[0].spot2,
        gear[0].spot3,
        gear[0].spot4
      ]
    }

    res.render('gear', {
      page: 'Gear settings',
      gear: formattedGear
    })
  } catch (err) {
    console.error(err)
    unexpectedError(res)
  }
}

function unexpectedError (res) {
  res.status(500).render('error', {
    page: 'Error 500',
    msg: 'There was an internal error'
  })
}

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    msg: 'Error 404, page not found'
  })
}

module.exports = {
  login,
  register,
  statistics,
  gear,
  unexpectedError,
  notFound
}
