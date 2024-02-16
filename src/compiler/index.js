const Debug = require('../debug')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile = async ({ api }) => {
  Debug.timeStart('compiler')
  const fileSystemTree = await api.fileSystemExplorer.exploreTree()
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
