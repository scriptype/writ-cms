const bodyParser = require('body-parser')
const { debugLog } = require('../debug')
const Settings = require('../settings')
const { getSlug } = require('../helpers')
const { decorate } = require('../decorations')

const next = (promise, thenPromise) => {
  return async (...args) => {
    await promise
    promise = await thenPromise(...args)
  }
}

const decorateApi = async (compilePromise) => {
  const utils = {
    settings: Settings.getSettings(),
    debugLog,
    getSlug
  }
  const decoratedApi = await decorate('previewApi', [])
  return decoratedApi.map(api => ({
    ...api,
    handle: next(
      compilePromise, 
      api.handle(utils)
    )
  }))
}

module.exports = {
  create: async (compilePromise) => {
    const api = await decorateApi(compilePromise)
    return [
      bodyParser.json(),
      ...api
    ]
  }
}
