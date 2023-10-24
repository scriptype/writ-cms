const Debug = require('../debug')
const Indexer = require('./indexing')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile = async ({ decorators, cache }) => {
  Debug.timeStart('compiler')
  const fileSystemIndex = await Indexer.indexFileSystem()
  const contentModel = await ContentModel.createContentModel(fileSystemIndex, decorators.content, cache)
  await Rendering.render(contentModel, decorators.rendering)
  Debug.timeEnd('compiler')
  return {
    fileSystemIndex,
    contentModel
  }
}

module.exports = {
  compile
}
