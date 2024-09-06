/*
const _ = require('lodash')
const { dirname, join, sep } = require('path')
const Settings = require('../../../../../settings')
const Dictionary = require('../../../../../dictionary')
const { getSlug, makePermalink, removeExtension, maybeRawHTMLType } = require('../../../../../helpers')
const parseTemplate = require('../../root/parseTemplate')
const { isLocalAsset } = require('../../root/models/localAsset')
const contentTypes = require('../contentTypes')

const DEFAULT_TYPE = 'text'

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

const getPostPermalink = (fsObject, categorized, foldered, outputPrefix) => {
  const { permalinkPrefix } = Settings.getSettings()
  const permalink = makePermalink({
    prefix: permalinkPrefix,
    parts: [
      outputPrefix,
      categorized ?
        dirname(fsObject.path).split(sep).slice(-1)[0] :
        '',
      fsObject.name
    ],
    addHTMLExtension: !foldered
  })
  return permalink
}

const getPostOutputPath = (fsObject, categorized, foldered) => {
  const parts = [
    categorized ? getSlug(dirname(fsObject.path).split(sep).slice(-1)[0]) : '',
    getSlug(fsObject.name),
    foldered ? 'index' : ''
  ].filter(Boolean)
  return join(...parts) + '.html'
}

const getPostCategory = (fsObject, categorized, outputPrefix) => {
  const name = categorized ?
    dirname(fsObject.path).split(sep).slice(-1)[0] :
    Dictionary.lookup('defaultCategoryName')

  const { permalinkPrefix } = Settings.getSettings()
  const permalink = makePermalink({
    prefix: permalinkPrefix,
    parts: [
      outputPrefix,
      name
    ]
  })

  return {
    name,
    permalink
  }
}

const _createPost = (fsObject, { categorized, foldered, outputPrefix }) => {
  const postFile = foldered ?
    fsObject.children.find(isFolderedPostIndex) :
    fsObject

  const localAssets = foldered ?
    fsObject.children.filter(isLocalAsset) :
    []

  const permalink = getPostPermalink(fsObject, categorized, foldered, outputPrefix)

  const metadata = parseTemplate(postFile, {
    localAssets,
    permalink
  })

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    data: {
      type: metadata.type || maybeRawHTMLType(postFile?.extension) || DEFAULT_TYPE,
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
      category: getPostCategory(fsObject, categorized, outputPrefix),
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

const createFolderedPost = (fsObject, outputPrefix) => {
  return _createPost(fsObject, {
    categorized: fsObject.depth > 0,
    foldered: true,
    outputPrefix
  })
}

const createDefaultCategoryPost = (fsObject, outputPrefix) => {
  return _createPost(fsObject, {
    categorized: false,
    foldered: false,
    outputPrefix
  })
}

const createPost = (fsObject, outputPrefix) => {
  return _createPost(fsObject, {
    categorized: true,
    foldered: false,
    outputPrefix
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
*/

const Settings = require('../../../../settings')
const { makePermalink, getSlug } = require('../../../../helpers')
const contentTypes = require('../contentTypes')
const Model = require('../../../lib/Model')

const DEFAULT_TYPE = 'text'

const getPermalink = (entry) => {
  const { permalinkPrefix } = Settings.getSettings()
  return makePermalink({
    prefix: permalinkPrefix,
    parts: [entry.data.name.data],
    addHTMLExtension: true
  })
}

const maybeRawHTMLType = (entry) => {
  return entry.data.format.data === 'hypertext'
}

const Post = new Model({
  schema: (entry) => ({
    type: 'object',
    data: {
      format: /(markdown|plaintext|hypertext|handlebars)/
    }
  }),

  create(entry) {
    const indexFile = entry
    const localAssets = []
    const permalink = getPermalink(entry)
    const { pagesDirectory } = Settings.getSettings()

    console.log('Model Post category', {
      name: 'getPostCategory(fsObject, categorized, outputPrefix)',
      permalink: 'no such category'
    })

    return {
      type: contentTypes.POST,
      data: {
        category: {
          name: 'getPostCategory(fsObject, categorized, outputPrefix)',
          permalink: 'no such category'
        },
        type: entry.data.type?.data || maybeRawHTMLType(entry) || DEFAULT_TYPE,
        format: entry.data.format?.data,
        title: entry.data.title?.data || entry.data.name?.data || '',
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
        path: entry.data.path.data,
        outputPath: getSlug(entry.data.name.data) + '.html',
        localAssets: entry.data.localAssets?.data || [],
      }
    }
  }
})

module.exports = Post
