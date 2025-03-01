const _ = require('lodash')
const Settings = require('../../../../settings')
const { maybeRawHTMLType } = require('../../../../helpers')
const contentTypes = require('../../contentTypes')
const parseTemplate = require('../../parseTemplate')
const { isLocalAsset } = require('../../models/localAsset')

const DEFAULT_TYPE = 'basic'

const isFolderedCollectionHomeIndex = (fsObject) => {
  return fsObject.type === contentTypes.FOLDERED_COLLECTION_HOME_INDEX
}

const _createCollectionHome = (fsObject, { foldered }) => {
  const indexFile = foldered ?
    fsObject.children.find(isFolderedCollectionHomeIndex) :
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
    type: contentTypes.COLLECTION_HOME,
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

const createFolderedCollectionHomeIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_COLLECTION_HOME_INDEX
  }
}

const createCollectionHome = (fsObject) => {
  return _createCollectionHome(fsObject, { foldered: false })
}

const createFolderedCollectionHome = (fsObject) => {
  return _createCollectionHome(fsObject, { foldered: true })
}

module.exports = {
  createCollectionHome,
  createFolderedCollectionHome,
  isFolderedCollectionHomeIndex,
  createFolderedCollectionHomeIndex
}
