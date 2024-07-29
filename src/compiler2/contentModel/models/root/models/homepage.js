const _ = require('lodash')
const Settings = require('../../../../../settings')
const { maybeRawHTMLType } = require('../../../../../helpers')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')
const { isLocalAsset } = require('./localAsset')

const DEFAULT_TYPE = 'basic'

const isFolderedHomepageIndex = (fsObject) => {
  return fsObject.type === contentTypes.FOLDERED_HOMEPAGE_INDEX
}

const _createHomepage = (fsObject, { foldered }) => {
  const indexFile = foldered ?
    fsObject.children.find(isFolderedHomepageIndex) :
    fsObject

  const localAssets = foldered ?
    fsObject.children.filter(isLocalAsset) :
    []

  const permalink = Settings.getSettings().permalinkPrefix

  const metadata = parseTemplate(indexFile, {
    permalink,
    localAssets
  })

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.HOMEPAGE,
    data: {
      type: metadata.type || maybeRawHTMLType(indexFile?.extension) || DEFAULT_TYPE,
      title: metadata.title || '',
      content: metadata.content || '',
      mentions: metadata.mentions || [],
      ...metadata.attributes,
      foldered,
      localAssets,
      permalink
    }
  }
}

const createFolderedHomepageIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_HOMEPAGE_INDEX
  }
}

const createHomepage = (fsObject) => {
  return _createHomepage(fsObject, { foldered: false })
}

const createFolderedHomepage = (fsObject) => {
  return _createHomepage(fsObject, { foldered: true })
}

module.exports = {
  createHomepage,
  createFolderedHomepage,
  isFolderedHomepageIndex,
  createFolderedHomepageIndex
}
