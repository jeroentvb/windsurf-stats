function localize (lang) {
  const localization = require(`../localization/${lang}.json`)
  return localization
}

module.exports = {
  port: 25561,
  saltRounds: 10,
  spotUrls: {
    schellinkhout: 'https://www.windfinder.com/weatherforecast/markermeer_schellinkhout',
    hondehemeltje: 'https://www.windfinder.com/weatherforecast/broekerhaven',
    andijk: 'https://www.windfinder.com/weatherforecast/jachthaven-stichting-andijk'
  },
  language: localize
}
