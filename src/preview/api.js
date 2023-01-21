const bodyParser = require('body-parser')
const { finalisePreviewApi } = require('../routines')
const { debugLog } = require('../debug')
const Settings = require('../settings')
const { getSlug } = require('../helpers')

const next = (promise, thenPromise) => {
  return async (...args) => {
    await promise
    promise = await thenPromise(...args)
  }
}

const getExpansionApis = (compilePromise) => {
  const utils = {
    settings: Settings.getSettings(),
    debugLog,
    getSlug
  }
  return finalisePreviewApi([]).map(api => ({
    ...api,
    handle: next(
      compilePromise, 
      api.handle(utils)
    )
  }))
}

module.exports = {
  create: (compilePromise) => {
    return [
      bodyParser.json(),
      ...getExpansionApis(compilePromise)
    ]
  }
}
