const _ = require('lodash')
const { dirname, extname } = require('path')
const { settings, paths } = require('./settings')
const { templateParser } = require('./rendering')
const { getSlug } = require('./helpers')
const { UNCATEGORIZED } = require('./constants')

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

const isSubPage = (fsObject) => {
  return fsObject.type === contentTypes.SUBPAGE
}

const isSubPages = (fsObject) => {
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
  return templateParser.isTemplate(fsObject.name) && hasContent(fsObject)
}

const isFolderedPostIndexFile = (fsObject) => {
  return isPostFile(fsObject) && fsObject.name.match(/^(index|post)\..+$/)
}

const removeExtension = (fileName) => {
  return fileName.replace(extname(fileName), '')
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

const createSubPage = (fsObject) => {
  const title = removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.SUBPAGE,
    data: {
      title,
      slug: getSlug(title),
      ...templateParser.parseTemplate(fsObject.content)
    }
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
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.CATEGORY,
    data: {
      posts: fsObject.children.filter(isPost),
      localAssets: fsObject.children.filter(isLocalAsset)
    }
  }
}

const createFolderedPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  const indexFile = fsObject.children.find(isFolderedPostIndex)
  const localAssets = fsObject.children.filter(isLocalAsset)
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.POST,
    data: {
      localAssets,
      title,
      slug: getSlug(title),
      category: dirname(fsObject.name),
      site: settings.site,
      ...templateParser.parseTemplate(indexFile.content)
    }
  }
}

const createFolderedPostIndex = (fsObject) => {
  return {
    ...fsObject,
    type: contentTypes.FOLDERED_POST_INDEX
  }
}

const createUncategorizedPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.POST,
    data: {
      title,
      slug: getSlug(title),
      category: UNCATEGORIZED,
      site: settings.site,
      ...templateParser.parseTemplate(fsObject.content)
    }
  }
}

const createPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  return {
    ...fsObject,
    type: contentTypes.POST,
    data: {
      title,
      slug: getSlug(title),
      category: dirname(fsObject.path),
      site: settings.site,
      ...templateParser.parseTemplate(fsObject.content),
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

const createContentModel = (parsedIndex) => {
  const ContentModel = {
    assets: [],
    subPages: [],
    categories: [],
    posts: [],
    unrecognized: []
  }

  parsedIndex.forEach(content => {
    switch (content.type) {
      case contentTypes.CATEGORY:
        ContentModel.categories.push(content)
        ContentModel.posts.push(content.data.posts)
        break

      case contentTypes.POST:
        const uncategorizedCategory = ContentModel.categories.find(
          category => category.name === UNCATEGORIZED
        )
        if (uncategorizedCategory) {
          uncategorizedCategory.posts.push(content)
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

  return ContentModel
}

module.exports = {
  parseIndex(siteIndex) {
    const parsedIndex = parseIndex(siteIndex)
    return createContentModel(parsedIndex)
  },
}
