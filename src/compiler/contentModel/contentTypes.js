const _ = require('lodash')
const { dirname, join } = require('path')
const Settings = require('../../settings')
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
  const { site } = Settings.getSettings()
  const title = removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.SUBPAGE,
    data: {
      title,
      ...parseTemplate({
        ...fsObject,
        isSubpage: true
      }),
      slug: getSlug(title),
      site,
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
  const { defaultCategoryName } = Settings.getSettings()
  return createCategory({
    name: defaultCategoryName,
    children: []
  })
}

const createFolderedPostIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_POST_INDEX
  }
}

const createFolderedPost = (fsObject) => {
  const { site, permalinkPrefix } = Settings.getSettings()
  const indexFile = fsObject.children.find(isFolderedPostIndex)
  const title = removeExtension(fsObject.name)
  const slug = getSlug(fsObject.name)
  const category = dirname(fsObject.path)
  const permalink = replaceExtension(join(permalinkPrefix, getSlug(category), slug), '.html')
  const localAssets = fsObject.children.filter(isLocalAsset)
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    content: indexFile.content,
    extension: indexFile.extension,
    data: {
      title,
      ...parseTemplate({
        ...indexFile,
        localAssets,
        permalink
      }),
      foldered: true,
      slug,
      permalink,
      category: {
        name: category,
        permalink: join(permalinkPrefix, getSlug(category))
      },
      localAssets,
      site,
      path: indexFile.path
    }
  }
}

const createDefaultCategoryPost = (fsObject) => {
  const { site, defaultCategoryName, permalinkPrefix } = Settings.getSettings()
  const title = removeExtension(fsObject.name)
  const slug = getSlug(fsObject.name)
  const permalink = replaceExtension(join(permalinkPrefix, slug), '.html')
  return {
    ...fsObject,
    type: contentTypes.POST,
    data: {
      title,
      ...parseTemplate(fsObject),
      slug,
      permalink,
      category: {
        name: defaultCategoryName,
        permalink: join(permalinkPrefix, getSlug(defaultCategoryName))
      },
      site,
      path: fsObject.path
    }
  }
}

const createPost = (fsObject) => {
  const { site, permalinkPrefix } = Settings.getSettings()
  const title = removeExtension(fsObject.name)
  const slug = getSlug(fsObject.name)
  const category = dirname(fsObject.path)
  const permalink = replaceExtension(join(permalinkPrefix, getSlug(category), slug), '.html')
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
        permalink: join(permalinkPrefix, getSlug(category))
      },
      site,
      path: fsObject.path
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
  createDefaultCategory,
  createFolderedPostIndex,
  createFolderedPost,
  createDefaultCategoryPost,
  createPost,
  createUnrecognizedDirectory,
  createUnrecognizedFile
}
