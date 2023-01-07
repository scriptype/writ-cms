const bodyParser = require('body-parser')

const Routes = {
  refresh: require('./routes/refresh'),
  post: require('./routes/post')
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
      route: "/cms/post",
      handle: next(
        compilePromise, 
        Routes.post({
          settings
        })
      )
    }
  ]
}
