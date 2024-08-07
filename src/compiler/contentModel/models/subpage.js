const _ = require('lodash')
const { join } = require('path')
const Settings = require('../../../settings')
const { getSlug, makePermalink, removeExtension, maybeRawHTMLType } = require('../../../helpers')
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
  const { out } = Settings.getSettings()
  const slug = getSlug(fsObject.name)
  const parts = [out, slug, foldered ? 'index' : ''].filter(Boolean)
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
