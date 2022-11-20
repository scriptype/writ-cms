const _ = require('lodash')
const { dirname, extname, join } = require('path')
const { settings, paths } = require('../settings')
const { templateParser } = require('../rendering')
const { getSlug, removeExtension } = require('../helpers')
const { UNCATEGORIZED } = require('../constants')
const Linker = require('./linking')
const contentTypes = require('./contentTypes')

const {
  isPost,
  isPostFile,
  isFolderedPostIndex,
  isFolderedPostIndexFile,
  isLocalAsset
} = contentTypes

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

const createSubPage = (fsObject) => {
  const { metadata, ...rest } = templateParser.parseTemplate(fsObject.content)
  const title = removeExtension(fsObject.name)
  const data = {
    ...rest,
    ...metadata,
    title,
    slug: getSlug(title)
  }
  return {
    ...fsObject,
    type: contentTypes.SUBPAGE,
    data
  }
}

const createSubPages = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.SUBPAGES,
    data: fsObject.children.map(createSubPage)
  }
}

const createCategory = (fsObject) => {
  const data = {
    posts: fsObject.children.filter(isPost),
    localAssets: fsObject.children.filter(isLocalAsset)
  }
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.CATEGORY,
    data
  }
}

const createFolderedPostIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_POST_INDEX
  }
}

const createFolderedPost = (fsObject) => {
  const indexFile = fsObject.children.find(isFolderedPostIndex)
  const { metadata, ...templateData } = templateParser.parseTemplate(indexFile.content)
  const title = removeExtension(fsObject.name)
  const slug = getSlug(title)
  const category = dirname(fsObject.path)
  const permalink = join('/', getSlug(category), slug)
  const data = {
    ...templateData,
    ...metadata,
    title,
    slug,
    permalink,
    category,
    localAssets: fsObject.children.filter(isLocalAsset),
    site: settings.site,
  }
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    data
  }
}

const createUncategorizedPost = (fsObject) => {
  const { metadata, ...templateData } = templateParser.parseTemplate(fsObject.content)
  const title = removeExtension(fsObject.name)
  const slug = getSlug(title)
  const permalink = join('/', slug)
  const data = {
    ...templateData,
    ...metadata,
    title,
    slug,
    permalink,
    category: UNCATEGORIZED,
    site: settings.site,
  }
  return {
    ...fsObject,
    type: contentTypes.POST,
    data
  }
}

const createPost = (fsObject) => {
  const { metadata, ...templateData } = templateParser.parseTemplate(fsObject.content)
  const title = removeExtension(fsObject.name)
  const slug = getSlug(title)
  const category = dirname(fsObject.path)
  const permalink = join('/', getSlug(category), slug)
  const data = {
    ...templateData,
    ...metadata,
    title,
    slug,
    permalink,
    category,
    site: settings.site,
  }
  return {
    ...fsObject,
    type: contentTypes.POST,
    data
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

const parseIndex = (tree) => {
  return tree.map(fsObject => {
    const isTemplate = templateParser.isTemplate(fsObject.name)
    const isDirectory = fsObject.children
    const isRootLevel = fsObject.depth === 0
    const isCategoryLevel = fsObject.depth === 1
    const isSubFolderLevel = fsObject.depth === 2

    if (!isDirectory && !isTemplate) {
      return createLocalAsset(fsObject)
    }

    if (isRootLevel) {
      if (isPostFile(fsObject)) {
        return createUncategorizedPost(fsObject)
      }
      if (fsObject.name === paths.SUBPAGES) {
        return createSubPages(fsObject)
      }
      if (fsObject.name === paths.assets) {
        return createAssets(fsObject)
      }
      return createCategory({
        ...fsObject,
        children: parseIndex(fsObject.children)
      })
    }

    if (isCategoryLevel) {
      if (isPostFile(fsObject)) {
        return createPost(fsObject)
      }
      if (fsObject.children.some(isFolderedPostIndexFile)) {
        return createFolderedPost({
          ...fsObject,
          children: parseIndex(fsObject.children)
        })
      }
    }

    if (isSubFolderLevel) {
      if (isFolderedPostIndexFile(fsObject)) {
        return createFolderedPostIndex(fsObject)
      }
    }

    if (isDirectory) {
      return createUnrecognizedDirectory({
        ...fsObject,
        children: parseIndex(fsObject.children)
      })
    }
    return createUnrecognizedFile(fsObject)
  })
}

const sortPosts = (a, b) => {
  return new Date(b.data.publishedAt) - new Date(a.data.publishedAt)
}

const createContentModel = (parsedIndex) => {
  const ContentModel = {
    assets: [],
    subPages: [],
    categories: [],
    posts: [],
    unrecognized: [],
    postsJSON: []
  }

  parsedIndex.forEach(content => {
    switch (content.type) {
      case contentTypes.CATEGORY:
        content.data.posts.sort(sortPosts)
        ContentModel.categories.push(content)
        ContentModel.posts.push(...content.data.posts)
        break

      case contentTypes.POST:
        const uncategorizedCategory = ContentModel.categories.find(
          category => category.name === UNCATEGORIZED
        )
        if (uncategorizedCategory) {
          uncategorizedCategory.data.posts.push(content)
          uncategorizedCategory.data.posts.sort(sortPosts)
        } else {
          ContentModel.categories.push({
            name: UNCATEGORIZED,
            data: {
              posts: [content],
              localAssets: []
            }
          })
        }
        ContentModel.posts.push(content)
        break

      case contentTypes.SUBPAGES:
        ContentModel.subPages.push(...content.data)
        break

      case contentTypes.ASSETS:
        ContentModel.assets.push(...content.data)
        break

      default:
        ContentModel.unrecognized.push(content)
        break
    }
  })

  ContentModel.posts.sort(sortPosts)
  ContentModel.postsJSON.push(
    ...ContentModel.posts.map(({ content, ...rest }) => rest)
  )

  return ContentModel
}

module.exports = {
  createContentModel(siteIndex) {
    const parsedIndex = parseIndex(siteIndex)
    const contentModel = createContentModel(parsedIndex)
    return Linker.link(contentModel)
  },
}
