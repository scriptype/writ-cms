const {
  pagesDirectory,
  assetsDirectory
} = require('../settings').getSettings()
const {
  isPostFile,
  isFolderedPostIndexFile,
  createLocalAsset,
  createUncategorizedPost,
  createSubpages,
  createAssets,
  createCategory,
  createPost,
  createFolderedPost,
  createFolderedPostIndex,
  createUnrecognizedDirectory,
  createUnrecognizedFile
} = require('./contentTypes')

const mapFSIndexToContentTree = (fsTree) => {
  return fsTree.map(fsObject => {
    const isDirectory = fsObject.children
    const isRootLevel = fsObject.depth === 0
    const isCategoryLevel = fsObject.depth === 1
    const isSubFolderLevel = fsObject.depth === 2

    if (!isDirectory && !isPostFile(fsObject)) {
      return createLocalAsset(fsObject)
    }

    if (isRootLevel) {
      if (isPostFile(fsObject)) {
        return createUncategorizedPost(fsObject)
      }
      if (fsObject.name === pagesDirectory) {
        return createSubpages(fsObject)
      }
      if (fsObject.name === assetsDirectory) {
        return createAssets(fsObject)
      }
      return createCategory({
        ...fsObject,
        children: mapFSIndexToContentTree(fsObject.children)
      })
    }

    if (isCategoryLevel) {
      if (isPostFile(fsObject)) {
        return createPost(fsObject)
      }
      if (fsObject.children && fsObject.children.some(isFolderedPostIndexFile)) {
        return createFolderedPost({
          ...fsObject,
          children: mapFSIndexToContentTree(fsObject.children)
        })
      }
    }

    if (isSubFolderLevel) {
      if (isFolderedPostIndexFile(fsObject)) {
        return createFolderedPostIndex(fsObject)
      }
    }

    if (isDirectory) {
      return createUnrecognizedDirectory({
        ...fsObject,
        children: mapFSIndexToContentTree(fsObject.children)
      })
    }
    return createUnrecognizedFile(fsObject)
  })
}

module.exports = mapFSIndexToContentTree
