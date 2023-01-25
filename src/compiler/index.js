const CustomTheme = require('../custom-theme')
const Scaffolder = require('./scaffolding')
const Indexer = require('./indexing')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile = async () => {
  const fileSystemIndex = await Indexer.indexFileSystem()
  const contentModel = ContentModel.createContentModel(fileSystemIndex)
  await CustomTheme.init(contentModel.customTheme)
  await Scaffolder.scaffoldSite()
  await Rendering.render(contentModel)
  return {
    fileSystemIndex,
    contentModel
  }
}

module.exports = {
  compile
}
