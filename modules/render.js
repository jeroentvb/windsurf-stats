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
  unexpectedError,
  notFound
}
