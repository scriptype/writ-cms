const Settings = require('../../settings')

const {
  isPostFile,
  isFolderedPostIndexFile,
  createLocalAsset,
  createDefaultCategoryPost,
  createSubpages,
  createAssets,
  createCategory,
  createPost,
  createFolderedPost,
  createFolderedPostIndex,
  createUnrecognizedDirectory,
  createUnrecognizedFile
} = require('./contentTypes')

const mapFSIndexToContentTree = (fsTree, cache) => {
  const { pagesDirectory, assetsDirectory } = Settings.getSettings()
  return fsTree.map(fsObject => {
    const isDirectory = fsObject.children
    const isRootLevel = fsObject.depth === 0
    const isCategoryLevel = fsObject.depth === 1
    const isSubFolderLevel = fsObject.depth === 2

    if (!isDirectory && !isSubFolderLevel && !isPostFile(fsObject)) {
      return createLocalAsset(fsObject)
    }

    if (isRootLevel) {
      if (isPostFile(fsObject)) {
        return createDefaultCategoryPost(fsObject, cache)
      }
      if (fsObject.name === pagesDirectory) {
        return createSubpages(fsObject, cache)
      }
      if (fsObject.name === assetsDirectory) {
        return createAssets(fsObject)
      }
      return createCategory({
        ...fsObject,
        children: mapFSIndexToContentTree(fsObject.children, cache)
      })
    }

    if (isCategoryLevel) {
      if (isPostFile(fsObject)) {
        return createPost(fsObject, cache)
      }
      if (fsObject.children && fsObject.children.some(isFolderedPostIndexFile)) {
        return createFolderedPost({
          ...fsObject,
          children: mapFSIndexToContentTree(fsObject.children, cache)
        }, cache)
      }
    }

    if (isSubFolderLevel) {
      if (isFolderedPostIndexFile(fsObject)) {
        return createFolderedPostIndex(fsObject)
      }
      if (!isDirectory) {
        return createLocalAsset(fsObject)
      }
    }

    if (isDirectory) {
      return createUnrecognizedDirectory({
        ...fsObject,
        children: mapFSIndexToContentTree(fsObject.children, cache)
      })
    }

    return createUnrecognizedFile(fsObject)
  })
}

module.exports = mapFSIndexToContentTree
