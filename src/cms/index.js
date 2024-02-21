const createAPI = require('./api')
const createServer = require('./server')

const createCMS = () => {
  const state = {
    settings: {},
    fileSystemTree: [],
    contentModel: {}
  }

  const api = createAPI({
    getSettings: () => state.settings,
    getFileSystemTree: () => state.fileSystemTree,
    getContentModel: () => state.contentModel
  })

  const server = createServer({
    api
  })

  return {
    api,
    server,
    setState(newState) {
      state.settings = newState.settings
      state.fileSystemTree = newState.fileSystemTree
      state.contentModel = newState.contentModel
    }
  }
}

module.exports = createCMS
