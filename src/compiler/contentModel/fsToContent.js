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
  createFolderedPostIndex
} = require('./contentTypes')

const mapFSIndexToContentTree = (fsTree, cache) => {
  const { pagesDirectory, assetsDirectory } = Settings.getSettings()
  return Promise.all(fsTree.map(async fsObject => {
    if (isPostFile(fsObject)) {
      return await createDefaultCategoryPost(fsObject, cache)
    }
    if (!fsObject.children) {
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
        children: fsObject.children.map(mapFolderedPostTree)
      }, cache)
    }
    return createCategory({
      ...fsObject,
      children: await Promise.all(
        fsObject.children.map(mapCategoryTree(cache))
      )
    })
  }))
}

const mapFolderedPostTree = (fsObject) => {
  if (isFolderedPostIndexFile(fsObject)) {
    return createFolderedPostIndex(fsObject)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const mapCategoryTree = (cache) => async (fsObject) => {
  if (isPostFile(fsObject)) {
    return await createPost(fsObject, cache)
  }
  if (fsObject.children && fsObject.children.some(isFolderedPostIndexFile)) {
    return await createFolderedPost({
      ...fsObject,
      children: fsObject.children.map(mapFolderedPostTree)
    }, cache)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

module.exports = mapFSIndexToContentTree
