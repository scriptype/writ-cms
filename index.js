// We need to init Settings before everything.
const setup = (settings = {}) => {
  const Settings = require('./settings')
  Settings.init(settings)

  return {
    compile() {
      return createCompiler({
        Scaffolder: require('./scaffolding'),
        Indexer: require('./indexing'),
        ContentModel: require('./contentModel'),
        Rendering: require('./rendering'),
      })
    },
    watch() {
      require('./watcher')(settings)
    }
  }
}

const createCompiler = async ({
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

module.exports = setup
