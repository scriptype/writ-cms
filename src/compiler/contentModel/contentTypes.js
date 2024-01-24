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
  FOLDERED_POST_INDEX: 'folderedPostIndex'
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
      ...(await parseTemplate({
        ...fsObject,
        isSubpage: true
      }, cache)),
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

const getTranscript = (post) => {
  const paths = [
    post.transcript,
    /transcript\.(txt|srt|html)$/,
    /.srt$/,
  ]
  const pathExpressions = paths.filter(Boolean).map(p => new RegExp(p))
  const matchingAssets = pathExpressions
    .map(path => {
      return post.localAssets.find(({ name }) => {
        return path.test(name)
      })
    })
    .filter(Boolean)
  const [firstMatch] = matchingAssets
  return firstMatch && firstMatch.content
}

const createFolderedPost = async (fsObject, cache) => {
  const { site, permalinkPrefix, defaultCategoryName } = Settings.getSettings()
  const indexFile = fsObject.children.find(isFolderedPostIndex)
  const title = removeExtension(fsObject.name)
  const slug = getSlug(fsObject.name)
  const isDefaultCategory = fsObject.depth === 0
  const categoryName = isDefaultCategory ?
    defaultCategoryName :
    dirname(fsObject.path)
  const permalinkPath = [permalinkPrefix]
  if (!isDefaultCategory) {
    permalinkPath.push(getSlug(categoryName))
  }
  permalinkPath.push(slug)
  const permalink = replaceExtension(join(...permalinkPath), '.html')
  const localAssets = fsObject.children.filter(isLocalAsset)
  const metadata = await parseTemplate({
    ...indexFile,
    localAssets,
    permalink
  }, cache)
  const transcript = getTranscript({
    ...metadata,
    localAssets
  })
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    content: indexFile.content,
    extension: indexFile.extension,
    data: {
      title,
      ...metadata,
      foldered: true,
      slug,
      permalink,
      category: {
        name: categoryName,
        permalink: join(permalinkPrefix, getSlug(categoryName))
      },
      localAssets,
      transcript,
      site,
      path: indexFile.path
    }
  }
}

const createDefaultCategoryPost = async (fsObject, cache) => {
  const { site, defaultCategoryName, permalinkPrefix } = Settings.getSettings()
  const title = removeExtension(fsObject.name)
  const slug = getSlug(fsObject.name)
  const permalink = replaceExtension(join(permalinkPrefix, slug), '.html')
  return {
    ...fsObject,
    type: contentTypes.POST,
    data: {
      title,
      ...(await parseTemplate(fsObject, cache)),
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

const createPost = async (fsObject, cache) => {
  const { site, permalinkPrefix } = Settings.getSettings()
  const title = removeExtension(fsObject.name)
  const slug = getSlug(fsObject.name)
  const categoryName = dirname(fsObject.path)
  const permalink = replaceExtension(join(permalinkPrefix, getSlug(categoryName), slug), '.html')
  return {
    ...fsObject,
    type: contentTypes.POST,
    data: {
      title,
      ...(await parseTemplate(fsObject, cache)),
      slug,
      permalink,
      category: {
        name: categoryName,
        permalink: join(permalinkPrefix, getSlug(categoryName))
      },
      site,
      path: fsObject.path
    }
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
