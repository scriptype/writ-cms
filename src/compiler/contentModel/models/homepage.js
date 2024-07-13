const _ = require('lodash')
const Settings = require('../../../settings')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')
const { isLocalAsset } = require('./localAsset')

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

  const type = indexFile.extension === '.html' ? 'raw-index-html' : 'basic'

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.HOMEPAGE,
    data: {
      type: metadata.type || type,
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
