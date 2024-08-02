/*
const _ = require('lodash')
const { join } = require('path')
const Settings = require('../../../../../settings')
const { getSlug, makePermalink, removeExtension, maybeRawHTMLType } = require('../../../../../helpers')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')
const { isLocalAsset } = require('./localAsset')

const DEFAULT_TYPE = 'basic'

const isSubpage = (fsObject) => {
  return fsObject.type === contentTypes.SUBPAGE
}

const isFolderedSubpageIndex = (fsObject) => {
  return fsObject.type === contentTypes.FOLDERED_SUBPAGE_INDEX
}

const getTranscript = (metadata, localAssets) => {
  if (!localAssets || !localAssets.length) {
    return undefined
  }
  const paths = [
    metadata.transcript,
    /transcript\.(txt|srt|html)$/,
    /.srt$/,
  ]
  const pathExpressions = paths.filter(Boolean).map(p => new RegExp(p))
  const matchingAssets = pathExpressions
    .map(path => {
      return localAssets.find(({ name }) => {
        return path.test(name)
      })
    })
    .filter(Boolean)
  const [firstMatch] = matchingAssets
  return firstMatch && firstMatch.content
}

const getSubpagePermalink = (fsObject, foldered) => {
  const { permalinkPrefix } = Settings.getSettings()
  return makePermalink({
    prefix: permalinkPrefix,
    parts: [fsObject.name],
    addHTMLExtension: !foldered
  })
}

const getSubpageOutputPath = (fsObject, foldered) => {
  const slug = getSlug(fsObject.name)
  const parts = [slug, foldered ? 'index' : ''].filter(Boolean)
  return join(...parts) + '.html'
}

const _createSubpage = (fsObject, { foldered }) => {
  const { pagesDirectory } = Settings.getSettings()

  const pageFile = foldered ?
    fsObject.children.find(isFolderedSubpageIndex) :
    fsObject

  const localAssets = foldered ?
    fsObject.children.filter(isLocalAsset) :
    []

  const permalink = getSubpagePermalink(fsObject, foldered)
  const metadata = parseTemplate(pageFile)

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.SUBPAGE,
    data: {
      type: metadata.type || maybeRawHTMLType(pageFile?.extension) || DEFAULT_TYPE,
      title: metadata.title || removeExtension(fsObject.name),
      cover: metadata.cover ? [permalink, metadata.cover].join('/') : '',
      media: metadata.media ? [permalink, metadata.media].join('/') : '',
      content: metadata.content,
      summary: metadata.summary,
      tags: metadata.tags,
      publishDatePrototype: {
        value: metadata.publishDate || fsObject.stats.birthtime,
        checkCache: !metadata.publishDate
      },
      mentions: metadata.mentions,
      ...metadata.attributes,
      slug: getSlug(fsObject.name),
      permalink,
      path: pageFile.path.replace(new RegExp(`^${pagesDirectory}`), ''),
      outputPath: getSubpageOutputPath(fsObject, foldered),
      foldered,
      localAssets,
      transcript: getTranscript(metadata, localAssets)
    }
  }
}

const createSubpage = (fsObject) => {
  return _createSubpage(fsObject, {
    foldered: false
  })
}

const createFolderedSubpage = (fsObject) => {
  return _createSubpage(fsObject, {
    foldered: true
  })
}

const createFolderedSubpageIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_SUBPAGE_INDEX
  }
}

module.exports = {
  createSubpage,
  createFolderedSubpage,
  createFolderedSubpageIndex
}

const _createSubpage = (fsObject, { foldered }) => {
  const { pagesDirectory } = Settings.getSettings()

  const pageFile = foldered ?
    fsObject.children.find(isFolderedSubpageIndex) :
    fsObject

  const localAssets = foldered ?
    fsObject.children.filter(isLocalAsset) :
    []

  const permalink = getSubpagePermalink(fsObject, foldered)
  const metadata = parseTemplate(pageFile)

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.SUBPAGE,
    data: {
      type: metadata.type || maybeRawHTMLType(pageFile?.extension) || DEFAULT_TYPE,
      title: metadata.title || removeExtension(fsObject.name),
      cover: metadata.cover ? [permalink, metadata.cover].join('/') : '',
      media: metadata.media ? [permalink, metadata.media].join('/') : '',
      content: metadata.content,
      summary: metadata.summary,
      tags: metadata.tags,
      publishDatePrototype: {
        value: metadata.publishDate || fsObject.stats.birthtime,
        checkCache: !metadata.publishDate
      },
      mentions: metadata.mentions,
      ...metadata.attributes,
      slug: getSlug(fsObject.name),
      permalink,
      path: pageFile.path.replace(new RegExp(`^${pagesDirectory}`), ''),
      outputPath: getSubpageOutputPath(fsObject, foldered),
      foldered,
      localAssets,
      transcript: getTranscript(metadata, localAssets)
    }
  }
}
*/

const Settings = require('../../../../settings')
const { makePermalink, getSlug } = require('../../../../helpers')
const contentTypes = require('../contentTypes')

const maybeRawHTMLType = (entry) => {
  return entry.data.format.data === 'hypertext'
}

const DEFAULT_TYPE = 'basic'

module.exports = class Subpage {
  constructor(contentTree) {
    this.contentModel = this.mapContentTree(contentTree)
  }

  getPermalink(entry) {
    const { permalinkPrefix } = Settings.getSettings()
    console.log('gerPermalink', entry)
    return makePermalink({
      prefix: permalinkPrefix,
      parts: [entry.data.name.data],
      addHTMLExtension: true
    })
  }

  mapContentTree(entry) {
    const indexFile = entry
    const localAssets = []
    const permalink = this.getPermalink(entry)
    const { pagesDirectory } = Settings.getSettings()

    return {
      type: contentTypes.SUBPAGE,
      data: {
        type: entry.data.type?.data || maybeRawHTMLType(entry) || DEFAULT_TYPE,
        format: entry.data.format?.data,
        title: entry.data.title?.data || entry.data.name.data || '',
        content: entry.data.content?.data || '',
        mentions: entry.data.mentions?.data || [],
        cover: entry.data.cover ? [permalink, entry.data.cover.data].join('/') : '',
        media: entry.data.media ? [permalink, entry.data.media.data].join('/') : '',
        summary: entry.data.summary?.data || '',
        tags: entry.data.tags?.data || [],
        publishDatePrototype: {
          value: entry.data.publishDate?.data || entry.data.stats.data.birthtime.data,
          checkCache: !entry.data.publishDate?.data
        },
        ...entry.data,
        slug: getSlug(entry.data.name.data),
        permalink,
        path: entry.data.path.data.replace(new RegExp(`^${pagesDirectory}`), ''),
        outputPath: getSlug(entry.data.name.data) + '.html',
        localAssets: entry.data.localAssets?.data || [],
      }
    }
  }
}
