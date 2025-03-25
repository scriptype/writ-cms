const Debug = require('../debug')
const Settings = require('../settings').getSettings()
const FileSystem = require('./fileSystem')
const ContentModel = require('./contentModel')
const Rendering = require('./rendering')

const compile2 = async () => {
  const ContentModel2 = require('./contentModel2')
  const Rendering2 = require('./rendering2')

  const fileSystemTree = await FileSystem.exploreTree()
  const contentModel = ContentModel2.create(fileSystemTree)

  return {}

  await Rendering2.render(contentModel)
  Debug.timeEnd('compiler')
  return {
    fileSystemTree,
    contentModel
  }
}

const compile = async () => {
  Debug.timeStart('compiler')
  if (Settings.compilerVersion === 2) {
    return compile2()
  }
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
