const Settings = require('../../settings')
const { createLocalAsset } = require('./models/localAsset')
const { createAssets } = require('./models/asset')
const { createSubpages } = require('./models/subpage')
const { createCategory } = require('./models/category')
const {
  createPost,
  createFolderedPost,
  createFolderedPostIndex,
  createDefaultCategoryPost
} = require('./models/post')

const templateExtensions = [
  '.hbs',
  '.handlebars',
  '.md',
  '.markdown',
  '.txt',
  '.text',
  '.html'
]

const isTemplateFile = (fsObject) => {
  return new RegExp(templateExtensions.join('|'), 'i').test(fsObject.extension)
}

const hasContent = (fsObject) => {
  return typeof fsObject.content !== 'undefined'
}

const isPostFile = (fsObject) => {
  return isTemplateFile(fsObject) && hasContent(fsObject)
}

const isFolderedPostIndexFile = (fsObject) => {
  return isPostFile(fsObject) && fsObject.name.match(/^(index|post)\..+$/)
}

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
