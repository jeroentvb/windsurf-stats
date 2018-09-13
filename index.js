const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const chalk = require('chalk')
const fs = require('fs')

var options = {
  port: 25561
}

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .get('/', index)
  .use(notFound)
  .listen(options.port, () => console.log(chalk.green(`Server listening on port ${options.port}...`)))

function index(req, res) {
  res.render('index', {
    page: 'Home'
  })
}

function notFound(req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
