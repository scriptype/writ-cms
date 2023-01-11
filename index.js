// We need to init Settings before everything.
const setup = (settings = {}) => {
  const Settings = require('./settings')
  Settings.init(settings)

  return {
    compile(settings) {
      return createCompiler({
        Settings: Settings.init(settings),
        Scaffolder: require('./scaffolding'),
        Indexer: require('./indexing'),
        ContentModel: require('./contentModel'),
        Rendering: require('./rendering'),
      })
    },
    watch(settings) {
      require('./watcher')(Settings.init(settings))
    }
  }
}

const createCompiler = async ({
  Settings,
  Scaffolder,
  Indexer,
  ContentModel,
  Rendering
}) => {
  const [ , fileSystemIndex ] = await Promise.all([
    Scaffolder.scaffoldSite(Settings),
    Indexer.indexFileSystem(Settings)
  ])
  const contentModel = ContentModel.createContentModel(fileSystemIndex)
  return Rendering.render(contentModel)
}

module.exports = setup
