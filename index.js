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

const createCompiler = ({
  Scaffolder,
  Indexer,
  ContentModel,
  Renderer,
  Targets,
  Settings
}) => {
  Scaffolder.scaffoldSite()
  Renderer.init()
  const siteIndex = Indexer.indexSite()
  const contentModel = ContentModel.createContentModel(siteIndex)
  Targets.compileHomepage(contentModel)
  Targets.compileSubPages(contentModel.subPages)
  Targets.compileCategoryPages(contentModel.categories)
  Targets.compilePosts(contentModel.posts)
  Targets.compilePostsJSON(contentModel.postsJSON)
}

module.exports = setup
