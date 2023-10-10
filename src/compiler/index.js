const Indexer = require('./indexing')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile = async () => {
  const fileSystemIndex = await Indexer.indexFileSystem()
  const contentModel = ContentModel.createContentModel(fileSystemIndex)
  await Rendering.render(contentModel)
  return {
    fileSystemIndex,
    contentModel
  }
}

module.exports = {
  compile
}
