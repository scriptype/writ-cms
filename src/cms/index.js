const createAPI = require('./api')
const createServer = require('./server')

const createCMS = (initialState = {}) => {
  const store = (() => {
    const state = Object.assign({
      ssgOptions: {},
      settings: {},
      fileSystemTree: [],
      contentModel: {},
      contentTypes: [],
      watcher: {
        directory: undefined,
        isRunning: false,
        stop: _=>_
      }
    }, initialState)

    return {
      getSettings: () => state.settings,
      getFileSystemTree: () => state.fileSystemTree,
      getContentModel: () => state.contentModel,
      getContentTypes: () => state.contentTypes,
      getSSGOptions: () => state.ssgOptions,
      isWatching: (directory) => {
        if (directory) {
          return state.watcher.isRunning && state.watcher.directory === directory
        }
        return state.watcher.isRunning
      },
      stopWatcher: () => {
        state.watcher.stop()
        state.watcher.isRunning = false
        state.watcher.directory = undefined
      },
      startWatcher: ({ directory, stop }) => {
        state.watcher.directory = directory
        state.watcher.isRunning = true
        state.watcher.stop = stop
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
