// We need to init Settings before everything.
const setup = (settings = {}) => {
  const Settings = require('./settings')
  Settings.init(settings)

  return createCompiler({
    Scaffolder: require('./scaffolding'),
    Indexer: require('./indexing'),
    Indexer2: require('./indexing-2'),
    ContentModel: require('./contentModel'),
    Targets: require('./targets'),
    Renderer: require('./rendering'),
    Settings
  })
}

const createCompiler = ({
  Scaffolder,
  Indexer,
  Indexer2,
  ContentModel,
  Renderer,
  Targets,
  Settings
}) => {
  const fs = require('fs')
  const siteIndex = Indexer2.indexSite()
  fs.writeFileSync('./index.json', JSON.stringify(siteIndex, null, 2))

  const content = ContentModel.createContentModel(siteIndex)
  fs.writeFileSync('./content.json', JSON.stringify(content, null, 2))

  return

  /*

  // Create target folder structure
  Scaffolder.scaffoldSite()

  // Set up rendering engine
  Renderer.init()

  // Build an index of file system objects
  const siteIndex = Indexer.indexSite()

  // Parse content and metadata
  const contentModel = Parser.parseIndex(siteIndex)
  const { assets, subPages, categories, posts, postsJSON } = contentModel

  // Compile contentModel into processed file system objects
  Targets.compileSubPages(subPages)
  Targets.compilePosts(posts)
  Targets.compileCategoryPages(categories)
  Targets.compileHomepage({ categories, posts })
  Targets.compilePostsJSON(postsJSON)

  // Finalize the target folder
  Scaffolder.finalizeSite()
  */
}

module.exports = setup
