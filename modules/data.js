const db = require('./db')
const render = require('./render')
const helper = require('./helper')
const config = require('../app-config.json')
const lang = helper.localize(config.language)
const scrape = require('wind-scrape')

async function submit (req, res) {
  const date = req.body.date

  let submittedData = {
    index: parseInt(req.body.hour),
    spot: req.body.spotOther ? req.body.spotOther : req.body.spot,
    sail: req.body.sailSizeOther ? req.body.sailSizeOther : req.body.sailSize,
    board: req.body.windsurfBoardOther ? req.body.windsurfBoardOther : req.body.windsurfBoard,
    rating: req.body.rating,
    note: req.body.note
  }

  if (date === 'today') {
    submittedData.date = helper.getToday()

    let responses

    try {
      const windfinder = await scrape.windfinder(submittedData.spot)

      windfinder.days[0].hours.forEach(hour => {
        if (parseInt(hour.hour) === submittedData.index) {
          responses = {
            spot: windfinder.spot,
            time: hour.hour,
            windspeed: hour.windspeed,
            windgust: hour.windspeed,
            winddirection: helper.getWindDirection(hour.winddirection, lang.wind_directions),
            temperature: hour.temperature
          }
        }
      })

      const allData = {
        ...submittedData,
        ...responses,
        windfinderLink: `https://www.windfinder.com/weatherforecast/${submittedData.spot}`
      }

      res.render('confirm-data', {
        page: lang.page.confirm_submission.name,
        data: allData,
        loginStatus: req.session.user,
        lang: lang,
        config: config
      })
    } catch (err) {
      console.error(err)
      render.unexpectedError(res)
    }
  } else {
    const additionalData = {
      date: req.body.dateInput,
      windspeed: req.body.windspeed,
      windgust: req.body.windgust,
      winddirection: req.body.winddirection
    }

    let manualData = {
      ...submittedData,
      ...additionalData
    }

    try {
      const windfinder = await scrape.windfinder(submittedData.spot)
      manualData.spot = windfinder.spot

      res.render('confirm-data', {
        page: lang.page.confirm_submission.name,
        data: manualData,
        loginStatus: req.session.user,
        lang: lang,
        config: config
      })
    } catch (err) {
      console.error(err)
      render.unexpectedError(res)
    }
  }
}

async function confirm (req, res) {
  const checkCorrect = req.body.confirmData

  const submittedData = {
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

  if (checkCorrect === 'incorrect') {
    res.redirect('/')
  } else {
    try {
      await db.query('INSERT INTO windsurfStatistics.statistics SET ?', submittedData)
      res.redirect('statistics')
    } catch (err) {
      console.error(err)
      render.unexpectedError(res)
    }
  }
}

async function send (req, res) {
  if (!req.session.user) {
    res.redirect('/login')
    return
  }

  try {
    const sessions = await db.query('SELECT * FROM windsurfStatistics.statistics WHERE userId = ?', req.session.user.id)

    sessions.forEach(session => {
      delete session.statisticId
      delete session.userId
    })

    res.json(sessions)
  } catch (err) {
    console.error(err)
    render.unexpectedError(res)
  }
}

module.exports = {
  submit,
  confirm,
  send
}
