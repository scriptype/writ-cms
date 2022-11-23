// We need to init Settings before everything.
const setup = (settings = {}) => {
  const Settings = require('./settings')
  Settings.init(settings)

  return createCompiler({
    Scaffolder: require('./scaffolding'),
    Indexer: require('./indexing'),
    ContentModel: require('./contentModel'),
    Targets: require('./targets'),
    Renderer: require('./rendering'),
    Settings
  })
}

const createCompiler = async ({
  Scaffolder,
  Indexer,
  ContentModel,
  Renderer,
  Targets,
  Settings
}) => {
  const [ , , fileSystemIndex ] = await Promise.all([
    Renderer.init(),
    Scaffolder.scaffoldSite(),
    Indexer.indexFileSystem()
  ])
  const contentModel = ContentModel.createContentModel(fileSystemIndex)
  Targets.compileHomepage(contentModel)
  Targets.compileSubPages(contentModel)
  Targets.compileCategoryPages(contentModel)
  Targets.compilePosts(contentModel)
  Targets.compilePostsJSON(contentModel)
}

module.exports = setup
