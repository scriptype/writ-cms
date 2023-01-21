const Scaffolder = require('./scaffolding')
const Indexer = require('./indexing')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile = async () => {
  const [ , fileSystemIndex ] = await Promise.all([
    Scaffolder.scaffoldSite(),
    Indexer.indexFileSystem()
  ])
  const contentModel = ContentModel.createContentModel(fileSystemIndex)
  return Rendering.render(contentModel)
}

module.exports = {
  compile
}
