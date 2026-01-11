const createAPI = require('./api')
const createServer = require('./server')

const createCMS = (initialState = {}) => {
  const store = (() => {
    const state = Object.assign({
      ssgOptions: {},
      settings: {},
      fileSystemTree: [],
      contentModel: {}
    }, initialState)

    return {
      getSettings: () => state.settings,
      getFileSystemTree: () => state.fileSystemTree,
      getContentModel: () => state.contentModel,
      getSSGOptions: () => state.ssgOptions,

      setState: (newState) => {
        Object.assign(state, newState)
      }
    }
  })()

  const api = createAPI(store)

  const server = createServer({
    api
  })

  return {
    api,
    server,
    ...store
  }
}

module.exports = createCMS
