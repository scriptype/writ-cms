const bodyParser = require('body-parser')
const { debugLog } = require('../debug')
const Settings = require('../settings')
const { getSlug } = require('../helpers')

const next = (promise, thenPromise) => {
  return async (...args) => {
    await promise
    promise = await thenPromise(...args)
  }
}

const getExpansionApis = (compilePromise, previewApiDecorator) => {
  const utils = {
    settings: Settings.getSettings(),
    debugLog,
    getSlug
  }
  return previewApiDecorator([]).map(api => ({
    ...api,
    handle: next(
      compilePromise, 
      api.handle(utils)
    )
  }))
}

module.exports = {
  create: (compilePromise, previewApiDecorator) => {
    return [
      bodyParser.json(),
      ...getExpansionApis(compilePromise, previewApiDecorator)
    ]
  }
}
