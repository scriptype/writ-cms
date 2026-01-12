const createAPI = require('./api')
const createServer = require('./server')

const createCMS = (initialState = {}) => {
  const store = (() => {
    const state = Object.assign({
      ssgOptions: {},
      settings: {},
      fileSystemTree: [],
      contentModel: {},
      watcher: {
        isRunning: false,
        stop: _=>_
      }
    }, initialState)

    return {
      getSettings: () => state.settings,
      getFileSystemTree: () => state.fileSystemTree,
      getContentModel: () => state.contentModel,
      getSSGOptions: () => state.ssgOptions,
      isWatching: () => state.watcher.isRunning,
      stopWatcher: () => {
        state.watcher.stop()
        state.watcher.isRunning = false
      },
      startWatcher: (stopFn) => {
        state.watcher.isRunning = true
        state.watcher.stop = stopFn
      },

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
