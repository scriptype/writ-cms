const Indexer = require('./indexing')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile = async ({ decorators, cache }) => {
  const fileSystemIndex = await Indexer.indexFileSystem()
  const contentModel = ContentModel.createContentModel(fileSystemIndex, decorators.content, cache)
  await Rendering.render(contentModel, decorators.rendering)
  return {
    fileSystemIndex,
    contentModel
  }
}

module.exports = {
  compile
}
