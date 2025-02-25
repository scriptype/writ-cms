const { join, sep } = require('path')
const _ = require('lodash')
const Settings = require('../../../../settings')
const { getSlug, makePermalink, maybeRawHTMLType } = require('../../../../helpers')
const { isLocalAsset } = require('../../models/localAsset')
const { isPost } = require('./post')
const parseTemplate = require('../../parseTemplate')
const contentTypes = require('../contentTypes')

const DEFAULT_TYPE = 'basic'

const isCategoryIndex = (fsObject) => {
  return fsObject.type === contentTypes.CATEGORY_INDEX
}

const getCategoryPermalink = (fsObject) => {
  const { permalinkPrefix } = Settings.getSettings()
  return makePermalink({
    prefix: permalinkPrefix,
    parts: fsObject.path.split(sep)
  })
}

const createCategory = (fsObject) => {
  const indexFile = fsObject.children.find(isCategoryIndex)
  const posts = fsObject.children.filter(isPost)

  const localAssets = fsObject.children.filter(isLocalAsset)
  const permalink = getCategoryPermalink(fsObject)
  const slug = getSlug(fsObject.name)

  const metadata = indexFile ?
    parseTemplate(indexFile, {
      localAssets,
      permalink
    }) : {
      attributes: {}
    }

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.CATEGORY,
    data: {
      type: metadata.type || maybeRawHTMLType(indexFile?.extension) || DEFAULT_TYPE,
      name: metadata.title || fsObject.name,
      content: metadata.content || '',
      summary: metadata.summary || '',
      mentions: metadata.mentions || [],
      path: fsObject.path,
      ...metadata.attributes,
      slug,
      permalink,
      posts,
      localAssets
    }
  }
}

const createCategoryIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.CATEGORY_INDEX
  }
}

module.exports = {
  isCategoryIndex,
  createCategory,
  createCategoryIndex
}
