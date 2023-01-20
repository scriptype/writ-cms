const bodyParser = require('body-parser')
const { expandPreviewApi } = require('../hooks')
const { debugLog } = require('../debug')
const { getSlug } = require('../helpers')

const next = (promise, thenPromise) => {
  return async (...args) => {
    await promise
    promise = await thenPromise(...args)
  }
}

const getExpansionApis = (compilePromise, settings) => {
  const utils = {
    debugLog,
    getSlug
  }
  return expandPreviewApi([]).map(api => ({
    ...api,
    handle: next(
      compilePromise, 
      api.handle(settings, utils)
    )
  }))
}

module.exports = {
  create: (compilePromise, settings) => {
    return [
      bodyParser.json(),
      ...getExpansionApis(compilePromise, settings)
    ]
  }
}
