const _ = require('lodash')
const { dirname, join } = require('path')
const Settings = require('../../settings')
const Dictionary = require('../../dictionary')
const { getSlug, removeExtension, replaceExtension } = require('../../helpers')
const { isTemplate, parseTemplate } = require('./templating')

const contentTypes = {
  POST: 'post',
  CATEGORY: 'category',
  SUBPAGE: 'subpage',
  SUBPAGES: 'subpages',
  ASSET: 'asset',
  ASSETS: 'assets',
  LOCAL_ASSET: 'localAsset',
  FOLDERED_POST_INDEX: 'folderedPostIndex'
}

const isPost = (fsObject) => {
  return fsObject.type === contentTypes.POST
}

const isSubpage = (fsObject) => {
  return fsObject.type === contentTypes.SUBPAGE
}

const isSubpages = (fsObject) => {
  return fsObject.type === contentTypes.SUBPAGES
}

const isAsset = (fsObject) => {
  return fsObject.type === contentTypes.ASSET
}

const isAssets = (fsObject) => {
  return fsObject.type === contentTypes.ASSETS
}

const isLocalAsset = (fsObject) => {
  return fsObject.type === contentTypes.LOCAL_ASSET
}

const isFolderedPostIndex = (fsObject) => {
  return fsObject.type === contentTypes.FOLDERED_POST_INDEX
}

const hasContent = (fsObject) => {
  return typeof fsObject.content !== 'undefined'
}

const isPostFile = (fsObject) => {
  return isTemplate(fsObject) && hasContent(fsObject)
}

const isFolderedPostIndexFile = (fsObject) => {
  return isPostFile(fsObject) && fsObject.name.match(/^(index|post)\..+$/)
}

const createAsset = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.ASSET
  }
}

const createAssets = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.ASSETS,
    data: fsObject.children.map(createAsset)
  }
}

const createLocalAsset = ({ stats, ...restFsObject }) => {
  return {
    ...restFsObject,
    type: contentTypes.LOCAL_ASSET
  }
}

const createSubpage = async (fsObject, cache) => {
  const { site } = Settings.getSettings()
  const title = removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.SUBPAGE,
    data: {
      title,
      ...(await parseTemplate(fsObject, cache, { subpage: true })),
      slug: getSlug(title),
      site,
    }
  }
}

const createSubpages = async (fsObject, cache) => {
  return {
    ...fsObject,
    type: contentTypes.SUBPAGES,
    data: await Promise.all(
      fsObject.children.map(fsObject => createSubpage(fsObject, cache))
    )
  }
}

const createCategory = (fsObject) => {
  const { permalinkPrefix } = Settings.getSettings()
  const slug = getSlug(fsObject.name)
  const data = {
    name: fsObject.name,
    slug,
    permalink: join(permalinkPrefix, slug),
    posts: fsObject.children.filter(isPost),
    localAssets: fsObject.children.filter(isLocalAsset)
  }
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.CATEGORY,
    data
  }
}

const createDefaultCategory = () => {
  return createCategory({
    name: Dictionary.lookup('defaultCategoryName'),
    children: []
  })
}

const createFolderedPostIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_POST_INDEX
  }
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

const getPostPermalink = (fsObject, isCategorized) => {
  const { permalinkPrefix } = Settings.getSettings()
  const permalink = join(
    permalinkPrefix,
    isCategorized ? getSlug(dirname(fsObject.path)) : '',
    getSlug(fsObject.name)
  )
  return replaceExtension(permalink, '.html')
}

const getPostCategory = (fsObject, isCategorized) => {
  const { permalinkPrefix } = Settings.getSettings()
  const categoryName = isCategorized ?
    dirname(fsObject.path) :
    Dictionary.lookup('defaultCategoryName')
  return {
    name: categoryName,
    permalink: join(permalinkPrefix, getSlug(categoryName))
  }
}

const _createPost = async (fsObject, cache, { categorized, foldered }) => {
  const postFile = foldered ?
    fsObject.children.find(isFolderedPostIndex) :
    fsObject

  const localAssets = foldered ?
    fsObject.children.filter(isLocalAsset) :
    []

  const permalink = getPostPermalink(fsObject, categorized)

  const metadata = await parseTemplate(postFile, cache, {
    localAssets,
    permalink
  })

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    data: {
      title: removeExtension(fsObject.name),
      ...metadata,
      slug: getSlug(fsObject.name),
      permalink,
      category: getPostCategory(fsObject, categorized),
      path: postFile.path,
      site: Settings.getSettings().site,
      foldered,
      localAssets,
      transcript: getTranscript(metadata, localAssets)
    }
  }
}

const createFolderedPost = (fsObject, cache) => {
  return _createPost(fsObject, cache, {
    categorized: fsObject.depth > 0,
    foldered: true
  })
}

const createDefaultCategoryPost = (fsObject, cache) => {
  return _createPost(fsObject, cache, {
    categorized: false,
    foldered: false
  })
}

const createPost = (fsObject, cache) => {
  return _createPost(fsObject, cache, {
    categorized: true,
    foldered: false
  })
}

module.exports = {
  ...contentTypes,
  isPost,
  isSubpage,
  isSubpages,
  isAsset,
  isAssets,
  isLocalAsset,
  isFolderedPostIndex,
  hasContent,
  isPostFile,
  isFolderedPostIndexFile,
  createAsset,
  createAssets,
  createLocalAsset,
  createSubpage,
  createSubpages,
  createCategory,
  createDefaultCategory,
  createFolderedPostIndex,
  createFolderedPost,
  createDefaultCategoryPost,
  createPost
}
