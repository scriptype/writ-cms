const middlewares = require('./middlewares')

module.exports = (compilePromise) => {
  return middlewares(compilePromise)
}
