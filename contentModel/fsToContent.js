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

const mapFSIndexToContentTree = (fsTree, Settings) => {
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
      if (fsObject.name === Settings.paths.SUBPAGES) {
        return createSubpages(fsObject)
      }
      if (fsObject.name === Settings.paths.assets) {
        return createAssets(fsObject)
      }
      return createCategory({
        ...fsObject,
        children: mapFSIndexToContentTree(fsObject.children, Settings)
      })
    }

    if (isCategoryLevel) {
      if (isPostFile(fsObject)) {
        return createPost(fsObject)
      }
      if (fsObject.children && fsObject.children.some(isFolderedPostIndexFile)) {
        return createFolderedPost({
          ...fsObject,
          children: mapFSIndexToContentTree(fsObject.children, Settings)
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
        children: mapFSIndexToContentTree(fsObject.children, Settings)
      })
    }
    return createUnrecognizedFile(fsObject)
  })
}

module.exports = mapFSIndexToContentTree
