const Settings = require('../settings')
const Debug = require('../debug')
const { contentRoot } = require('../helpers')
const FileSystemDriver = require('./drivers/fs')
const RootOntology = require('./ontologies/root')

const getContentRoot = async () => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  const rootContentPath = await contentRoot(rootDirectory, contentDirectory)
  Debug.debugLog('contentRoot', rootContentPath)
  return rootContentPath
}

const compile = async () => {
  Debug.timeStart('compiler')
  const contentRootPath = await getContentRoot()
  const fileSystem = new FileSystemDriver()
  const {
    fileSystemTree,
    contentTree
  } = await fileSystem.parse(contentRootPath)
  const root = new RootOntology(contentTree)
  console.log('root ontology model', root.model())
  // await root.render()
  Debug.timeEnd('compiler')
  return {
    fileSystemTree,
    contentTree,
    contentModel: await root.model()
  }
}

module.exports = {
  compile
}
