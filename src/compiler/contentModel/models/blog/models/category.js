const { join } = require('path')
const _ = require('lodash')
const Settings = require('../../../../../settings')
const { getSlug, makePermalink, maybeRawHTMLType } = require('../../../../../helpers')
const parseTemplate = require('../../root/parseTemplate')
const { isLocalAsset } = require('../../root/models/localAsset')
const contentTypes = require('../contentTypes')
const { isPost } = require('./post')

const DEFAULT_TYPE = 'basic'

const isCategoryIndex = (fsObject) => {
  return fsObject.type === contentTypes.CATEGORY_INDEX
}

const getCategoryPermalink = (fsObject) => {
  const { permalinkPrefix } = Settings.getSettings()
  return makePermalink({
    prefix: permalinkPrefix,
    parts: [fsObject.name]
  })
}

const createCategory = (fsObject, prefix) => {
  const { out } = Settings.getSettings()
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
