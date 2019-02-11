const db = require('./db')
const helper = require('./helper')
const config = require('../app-config.json')
const lang = helper.localize(config.language)
const scrape = require('wind-scrape')

function submit (req, res) {
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

function confirm (req, res, next) {
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

function send (req, res) {
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

module.exports = {
  submit,
  confirm,
  send
}
