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
        isWatching: false,
        skipBuild: false,
        stop: _=>_
      },
    }, initialState)

    const setState = (newState) => {
      Object.assign(state, newState)
    }

    return {
      getSettings: () => state.settings,
      getFileSystemTree: () => state.fileSystemTree,
      getContentModel: () => state.contentModel,
      getContentTypes: () => state.contentTypes,
      getSSGOptions: () => state.ssgOptions,
      shouldSkipWatcherBuild: () => state.watcher.skipBuild,

      skipWatcherBuild: () => {
        state.watcher.skipBuild = true
      },

      unskipWatcherBuild: () => {
        state.watcher.skipBuild = false
      },

      isWatching: (directory) => {
        if (directory) {
          return state.watcher.isWatching && state.watcher.directory === directory
        }
        return state.watcher.isWatching
      },

      stopWatcher: () => {
        state.watcher.stop()
        state.watcher.isWatching = false
        state.watcher.directory = undefined
      },

      startWatcher: ({ directory, stop }) => {
        state.watcher.directory = directory
        state.watcher.isWatching = true
        state.watcher.stop = stop
      },

      setState
    }
  })()

  const api = createAPI(store)

  const server = createServer({
    api,
    state: store
  })

  return {
    api,
    server,
    ...store
  }
}

module.exports = createCMS
