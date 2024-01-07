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
  return Promise.all(fsTree.map(async fsObject => {
    const isDirectory = fsObject.children
    const { depth } = fsObject

    if (depth === 0) {
      if (isPostFile(fsObject)) {
        return await createDefaultCategoryPost(fsObject, cache)
      }
      if (!isDirectory) {
        return createLocalAsset(fsObject)
      }
      if (fsObject.name === pagesDirectory) {
        return await createSubpages(fsObject, cache)
      }
      if (fsObject.name === assetsDirectory) {
        return createAssets(fsObject)
      }
      if (fsObject.children.some(isFolderedPostIndexFile)) {
        return await createFolderedPost({
          ...fsObject,
          children: await mapFSIndexToContentTree(fsObject.children, cache)
        }, cache)
      }
      return createCategory({
        ...fsObject,
        children: await mapFSIndexToContentTree(fsObject.children, cache)
      })
    }

    if (depth === 1) {
      if (isFolderedPostIndexFile(fsObject)) {
        return createFolderedPostIndex(fsObject)
      }
      if (isPostFile(fsObject)) {
        return await createPost(fsObject, cache)
      }
      if (!isDirectory) {
        return createLocalAsset(fsObject)
      }
      if (fsObject.children.some(isFolderedPostIndexFile)) {
        return await createFolderedPost({
          ...fsObject,
          children: await mapFSIndexToContentTree(fsObject.children, cache)
        }, cache)
      }
    }

    if (depth === 2) {
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
        children: await mapFSIndexToContentTree(fsObject.children, cache)
      })
    }

    return createUnrecognizedFile(fsObject)
  }))
}

module.exports = mapFSIndexToContentTree
