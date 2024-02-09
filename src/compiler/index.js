const Debug = require('../debug')
const FileSystem = require('./fileSystem')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile = async () => {
  Debug.timeStart('compiler')
  const fileSystemTree = await FileSystem.exploreTree()
  const contentModel = await ContentModel.create(fileSystemTree)
  await Rendering.render(contentModel)
  Debug.timeEnd('compiler')
  return {
    fileSystemTree,
    contentModel
  }
}

module.exports = {
  compile
}
