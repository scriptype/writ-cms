// We need to init Settings before everything.
const setup = (settings = {}) => {
  const Settings = require('./settings')
  Settings.init(settings)

  return createCompiler({
    Scaffolder: require('./scaffolding'),
    Indexer: require('./indexing'),
    ContentModel: require('./contentModel'),
    Targets: require('./targets'),
  })
}

const createCompiler = async ({
  Scaffolder,
  Indexer,
  ContentModel,
  Targets
}) => {
  const [ , fileSystemIndex ] = await Promise.all([
    Scaffolder.scaffoldSite(),
    Indexer.indexFileSystem()
  ])
  const contentModel = ContentModel.createContentModel(fileSystemIndex)
  Targets.compileHomepage(contentModel)
  Targets.compileSubPages(contentModel)
  Targets.compilePostsJSON(contentModel)
  await Targets.compileCategoryPages(contentModel)
  Targets.compilePosts(contentModel)
}

module.exports = setup
