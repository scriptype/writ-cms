const bodyParser = require('body-parser')

const Routes = {
  refresh: require('./routes/refresh'),
  update: require('./routes/update')
}

const next = (promise, thenPromise) => {
  return async (...args) => {
    await promise
    promise = await thenPromise(...args)
  }
}

module.exports = (compilePromise, settings) => {
  return [
    bodyParser.json(),
    {
      route: "/cms/refresh",
      handle: next(
        compilePromise,
        Routes.refresh({
          settings
        })
      )
    },
    {
      route: "/cms/update",
      handle: next(
        compilePromise, 
        Routes.update({
          settings
        })
      )
    }
  ]
}
