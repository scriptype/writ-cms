const { join } = require('path')
const _ = require('lodash')
const Settings = require('../../../settings')
const { getSlug } = require('../../../helpers')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')
const { isPost } = require('./post')
const { isLocalAsset } = require('./localAsset')

const isCategoryIndex = (fsObject) => {
  return fsObject.type === contentTypes.CATEGORY_INDEX
}

const createCategory = (fsObject) => {
  const indexFile = fsObject.children.find(isCategoryIndex)
  const posts = fsObject.children.filter(isPost)

  const localAssets = fsObject.children.filter(isLocalAsset)
  const slug = getSlug(fsObject.name)
  const permalink = join(Settings.getSettings().permalinkPrefix, slug)

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
      type: metadata.type || '',
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
