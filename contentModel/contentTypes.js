const _ = require('lodash')
const { dirname, join } = require('path')
const { settings } = require('../settings')
const { UNCATEGORIZED } = require('../constants')
const { getSlug, removeExtension } = require('../helpers')
const { isTemplate, parseTemplate } = require('./templating')

const contentTypes = {
  POST: 'post',
  CATEGORY: 'category',
  SUBPAGE: 'subpage',
  SUBPAGES: 'subpages',
  ASSET: 'asset',
  ASSETS: 'assets',
  LOCAL_ASSET: 'localAsset',
  FOLDERED_POST_INDEX: 'folderedPostIndex',
  UNRECOGNIZED_DIRECTORY: 'unrecognizedDirecoty',
  UNRECOGNIZED_FILE: 'unrecognizedFile'
}

const isPost = (fsObject) => {
  return fsObject.type === contentTypes.POST
}

const isCategory = (fsObject) => {
  return fsObject.type === contentTypes.CATEGORY
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

const isUnrecozgnizedDirectory = (fsObject) => {
  return fsObject.type === contentTypes.UNRECOGNIZED_DIRECTORY
}

const isUnrecozgnizedFile = (fsObject) => {
  return fsObject.type === contentTypes.UNRECOGNIZED_FILE
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

const createLocalAsset = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.LOCAL_ASSET
  }
}

const createSubpage = (fsObject) => {
  const title = removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.SUBPAGE,
    data: {
      title,
      ...parseTemplate(fsObject),
      slug: getSlug(title),
      site: settings.site,
    }
  }
}

const createSubpages = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.SUBPAGES,
    data: fsObject.children.map(createSubpage)
  }
}

const createCategory = (fsObject) => {
  const slug = getSlug(fsObject.name)
  const data = {
    name: fsObject.name,
    slug,
    permalink: slug,
    posts: fsObject.children.filter(isPost),
    localAssets: fsObject.children.filter(isLocalAsset)
  }
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.CATEGORY,
    data
  }
}

const createUncategorizedCategory = (posts) => {
  return createCategory({
    name: UNCATEGORIZED,
    children: posts
  })
}

const createFolderedPostIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_POST_INDEX
  }
}

const createFolderedPost = (fsObject) => {
  const indexFile = fsObject.children.find(isFolderedPostIndex)
  const title = removeExtension(fsObject.name)
  const slug = getSlug(title)
  const category = dirname(fsObject.path)
  const permalink = join('/', getSlug(category), slug)
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    content: indexFile.content,
    extension: indexFile.extension,
    data: {
      title,
      ...parseTemplate(indexFile),
      foldered: true,
      slug,
      permalink,
      category: {
        name: category,
        permalink: join('/', getSlug(category))
      },
      localAssets: fsObject.children.filter(isLocalAsset),
      site: settings.site,
    }
  }
}

const createUncategorizedPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  const slug = getSlug(title)
  const permalink = join('/', slug)
  return {
    ...fsObject,
    type: contentTypes.POST,
    data: {
      title,
      ...parseTemplate(fsObject),
      slug,
      permalink,
      category: {
        name: UNCATEGORIZED,
        permalink: join('/', getSlug(UNCATEGORIZED))
      },
      site: settings.site,
    }
  }
}

const createPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  const slug = getSlug(title)
  const category = dirname(fsObject.path)
  const permalink = join('/', getSlug(category), slug)
  return {
    ...fsObject,
    type: contentTypes.POST,
    data: {
      title,
      ...parseTemplate(fsObject),
      slug,
      permalink,
      category: {
        name: category,
        permalink: join('/', getSlug(category))
      },
      site: settings.site,
    }
  }
}

const createUnrecognizedDirectory = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.UNRECOGNIZED_DIRECTORY
  }
}

const createUnrecognizedFile = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.UNRECOGNIZED_FILE
  }
}

module.exports = {
  ...contentTypes,
  isPost,
  isCategory,
  isSubpage,
  isSubpages,
  isAsset,
  isAssets,
  isLocalAsset,
  isFolderedPostIndex,
  isUnrecozgnizedDirectory,
  isUnrecozgnizedFile,
  hasContent,
  isPostFile,
  isFolderedPostIndexFile,
  createAsset,
  createAssets,
  createLocalAsset,
  createSubpage,
  createSubpages,
  createCategory,
  createUncategorizedCategory,
  createFolderedPostIndex,
  createFolderedPost,
  createUncategorizedPost,
  createPost,
  createUnrecognizedDirectory,
  createUnrecognizedFile,
}
