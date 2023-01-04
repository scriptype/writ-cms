const middlewares = require('./middlewares')

module.exports = (compilePromise, settings) => {
  return middlewares(compilePromise, settings)
}
