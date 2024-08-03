/*
module.exports = {
  createHomepage,
  createFolderedHomepage,
  isFolderedHomepageIndex,
  createFolderedHomepageIndex
}

const {
  MarkdownContent,
  HTMLContent,
  PlainTextContent
} = require('./models/content')

const Homepage = {
  query: [{
    name: /(home|homepage|index)/,
    content: Q.or(MarkdownContent, HTMLContent, PlainTextContent)
  }, {
    subTree: {
      name: /(home|homepage|index)/,
      content: [MarkdownContent, HTMLContent, PlainTextContent]
    }
  }]
}

module.exports = Homepage

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
*/

const Settings = require('../../../../settings')
const contentTypes = require('../contentTypes')

const maybeRawHTMLType = (entry) => {
  return entry.data.format.data === 'hypertext'
}

const DEFAULT_TYPE = 'basic'

module.exports = class Homepage {
  constructor(contentTree) {
    this.contentModel = this.mapContentTree(contentTree)
  }

  mapContentTree(entry) {
    const indexFile = entry
    const localAssets = []
    const permalink = Settings.getSettings().permalinkPrefix
    return {
      type: contentTypes.HOMEPAGE,
      data: {
        type: entry.data.type?.data || maybeRawHTMLType(indexFile) || DEFAULT_TYPE,
        format: entry.data.format?.data,
        title: entry.data.title?.data || '',
        content: entry.data.content?.data || '',
        mentions: entry.data.mentions?.data || [],
        localAssets,
        permalink,
      }
    }
  }
}
