const Settings = require('../settings')
const Debug = require('../debug')
const { contentRoot } = require('../helpers')
const FileSystemDriver = require('./drivers/fs')
const Ontologies = require('./ontologies')
const Renderer = require('./renderer')

const getContentRoot = async () => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  const rootContentPath = await contentRoot(rootDirectory, contentDirectory)
  Debug.debugLog('contentRoot', rootContentPath)
  return rootContentPath
}

const compile = async () => {
  Debug.timeStart('compiler')
  const { rootContentModel } = Settings.getSettings()
  const contentRootPath = await getContentRoot()
  const fileSystem = new FileSystemDriver()
  const {
    fileSystemTree,
    contentTree
  } = await fileSystem.parse(contentRootPath)
  console.log('settings.rootContentModel', rootContentModel)
  const RootOntology = Ontologies.get(rootContentModel)
  const root = new RootOntology(contentTree.tree)
  await Renderer.init()
  await root.render(Renderer)
  Debug.timeEnd('compiler')
  return {
    fileSystemTree,
    contentTree,
    contentModel: root.contentModel
  }
}

module.exports = {
  compile
}
