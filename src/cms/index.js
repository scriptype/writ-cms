const createAPI = require('./api')
const createServer = require('./server')

const createCMS = (settings) => {
  const state = {
    settings
  }
  const api = createAPI({
    getSettings: () => state.settings
  })
  const server = createServer({
    api
  })
  return {
    api,
    server,
    setSettings(newSettings) {
      state.settings = newSettings
    }
  }
}

module.exports = createCMS
