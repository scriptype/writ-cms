const { join, resolve } = require('path')
const Settings = require('./settings')

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
  start(rootDirectory, { watch } = {}) {
    Settings.init('start', rootDirectory)
    if (typeof watch === 'undefined' || watch === true) {
      require('./watcher')
      return Promise.resolve()
    }
    return compile({
      Scaffolder: require('./scaffolding'),
      Indexer: require('./indexing'),
      ContentModel: require('./contentModel'),
      Rendering: require('./rendering'),
    })
  },

  build(rootDirectory) {
    Settings.init('build', rootDirectory)
    return compile({
      Scaffolder: require('./scaffolding'),
      Indexer: require('./indexing'),
      ContentModel: require('./contentModel'),
      Rendering: require('./rendering'),
    })
  }
}
