const _ = require('lodash')
const { dirname, join } = require('path')
const Settings = require('../../../settings')
const Dictionary = require('../../../dictionary')
const { getSlug, removeExtension, replaceExtension } = require('../../../helpers')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')
const { isLocalAsset } = require('./localAsset')

const isPost = (fsObject) => {
  return fsObject.type === contentTypes.POST
}

const isFolderedPostIndex = (fsObject) => {
  return fsObject.type === contentTypes.FOLDERED_POST_INDEX
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

const getPostPermalink = (fsObject, categorized) => {
  const { permalinkPrefix } = Settings.getSettings()
  const permalink = join(
    permalinkPrefix,
    categorized ? getSlug(dirname(fsObject.path)) : '',
    getSlug(fsObject.name)
  )
  return replaceExtension(permalink, '.html')
}

const getPostOutputPath = (fsObject, categorized, foldered) => {
  const { out } = Settings.getSettings()
  const categorySlug = categorized ? getSlug(dirname(fsObject.path)) : ''
  const postSlug = getSlug(fsObject.name)
  return replaceExtension(
    join(
      out,
      categorySlug,
      postSlug,
      foldered ? 'index.html' : ''
    ),
    '.html'
  )
}

const getPostCategory = (fsObject, categorized) => {
  const { permalinkPrefix } = Settings.getSettings()
  const categoryName = categorized ?
    dirname(fsObject.path) :
    Dictionary.lookup('defaultCategoryName')
  return {
    name: categoryName,
    permalink: join(permalinkPrefix, getSlug(categoryName))
  }
}

const _createPost = (fsObject, { categorized, foldered }) => {
  const postFile = foldered ?
    fsObject.children.find(isFolderedPostIndex) :
    fsObject

  const localAssets = foldered ?
    fsObject.children.filter(isLocalAsset) :
    []

  const permalink = getPostPermalink(fsObject, categorized)

  const metadata = parseTemplate(postFile, {
    localAssets,
    permalink
  })

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    data: {
      type: metadata.type || 'text',
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
      category: getPostCategory(fsObject, categorized),
      path: postFile.path,
      outputPath: getPostOutputPath(fsObject, categorized, foldered),
      handle: removeExtension(fsObject.path),
      foldered,
      localAssets,
      transcript: getTranscript(metadata, localAssets),
    }
  }
}

const createFolderedPostIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_POST_INDEX
  }
}

const createFolderedPost = (fsObject) => {
  return _createPost(fsObject, {
    categorized: fsObject.depth > 0,
    foldered: true
  })
}

const createDefaultCategoryPost = (fsObject) => {
  return _createPost(fsObject, {
    categorized: false,
    foldered: false
  })
}

const createPost = (fsObject) => {
  return _createPost(fsObject, {
    categorized: true,
    foldered: false
  })
}

module.exports = {
  isPost,
  isFolderedPostIndex,
  createFolderedPostIndex,
  createFolderedPost,
  createDefaultCategoryPost,
  createPost
}
