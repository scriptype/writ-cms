const createAPI = require('./api')
const createServer = require('./server')

const createCMS = (settings) => {
  const api = createAPI(settings)
  const server = createServer({ api })
  return {
    api,
    server
  }
}

module.exports = createCMS
