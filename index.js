const { join, resolve } = require('path')
const Settings = require('./settings')
const Debug = require('./debug')
const Hooks = require('./hooks')

const compile = async ({
  Scaffolder,
  Indexer,
  ContentModel,
  Rendering
}) => {
  const [ , fileSystemIndex ] = await Promise.all([
    Scaffolder.scaffoldSite(),
    Indexer.indexFileSystem()
  ])
  const contentModel = ContentModel.createContentModel(fileSystemIndex)
  return Rendering.render(contentModel)
}

module.exports = {
  ...Hooks.api,

  async start({ rootDirectory, watch, debug } = {}) {
    Debug.init(debug)
    await Settings.init({
      mode: 'start',
      rootDirectory
    })
    if (watch !== false) {
      const Preview = require('./preview')
      return Preview.init()
    }
    return compile({
      Scaffolder: require('./scaffolding'),
      Indexer: require('./indexing'),
      ContentModel: require('./contentModel'),
      Rendering: require('./rendering'),
    })
  },

  async build({ rootDirectory, debug }) {
    Debug.init(debug)
    await Settings.init({
      mode: 'build',
      rootDirectory
    })
    return compile({
      Scaffolder: require('./scaffolding'),
      Indexer: require('./indexing'),
      ContentModel: require('./contentModel'),
      Rendering: require('./rendering'),
    })
  },

  getDefaultSettings(...args) {
    return Settings.getDefaultSettings(...args)
  }
}
