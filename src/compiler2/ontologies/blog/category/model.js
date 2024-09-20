/*
const { join } = require('path')
const _ = require('lodash')
const Settings = require('../../../../../settings')
const Dictionary = require('../../../../../dictionary')
const { getSlug, makePermalink, maybeRawHTMLType } = require('../../../../../helpers')
const parseTemplate = require('../../root/parseTemplate')
const { isLocalAsset } = require('../../root/models/localAsset')
const contentTypes = require('../contentTypes')
const { isPost } = require('./post')

const DEFAULT_TYPE = 'basic'

const isCategoryIndex = (fsObject) => {
  return fsObject.type === contentTypes.CATEGORY_INDEX
}

const getCategoryPermalink = (fsObject, outputPrefix) => {
  const name = fsObject.name || Dictionary.lookup('defaultCategoryName')

  const { permalinkPrefix } = Settings.getSettings()
  const permalink = makePermalink({
    prefix: permalinkPrefix,
    parts: [outputPrefix, name]
  })
  return permalink
}

const createCategoryIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.CATEGORY_INDEX
  }
}

  create(entry, outputPrefix) {
    const { out } = Settings.getSettings()
    const indexFile = entry.subTree
    const posts = fsObject.children.filter(isPost)

    const localAssets = fsObject.children.filter(isLocalAsset)
    const permalink = getCategoryPermalink(fsObject, outputPrefix)
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

module.exports = {
  isCategoryIndex,
  createCategory,
  createCategoryIndex
}
*/

const Settings = require('../../../../settings')
const { makePermalink, getSlug } = require('../../../../helpers')
const contentTypes = require('../contentTypes')
const Model = require('../../../lib/Model')

const Category = new Model({
  schema: (entry) => ({
    type: 'object',
    subTree: t => !!t
  }),

  create(entry, outputPrefix) {
    const { out } = Settings.getSettings()
    console.log('Category.create entry', entry)
    return {
      type: contentTypes.CATEGORY,
      data: {
        'category in progress': true
      }
    }
    const indexFile = entry.subTree
    const posts = fsObject.children.filter(isPost)

    const localAssets = fsObject.children.filter(isLocalAsset)
    const permalink = getCategoryPermalink(fsObject, outputPrefix)
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
})

module.exports = Category
