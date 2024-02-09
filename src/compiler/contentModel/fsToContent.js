const Settings = require('../../settings')
const Dictionary = require('../../dictionary')
const { createLocalAsset } = require('./models/localAsset')
const { createAssets } = require('./models/asset')
const { createSubpages } = require('./models/subpage')
const { createCategory } = require('./models/category')
const {
  createPost,
  createFolderedPost,
  createFolderedPostIndex,
  createDefaultCategoryPost
} = require('./models/post')

const templateExtensions = [
  '.hbs',
  '.handlebars',
  '.md',
  '.markdown',
  '.txt',
  '.text',
  '.html'
]

const isTemplateFile = (fsObject) => {
  return new RegExp(templateExtensions.join('|'), 'i').test(fsObject.extension)
}

const hasContent = (fsObject) => {
  return typeof fsObject.content !== 'undefined'
}

const isPostFile = (fsObject) => {
  return isTemplateFile(fsObject) && hasContent(fsObject)
}

const isFolderedPostIndexFile = (fsObject) => {
  return isPostFile(fsObject) && fsObject.name.match(/^(index|post)\..+$/)
}

const isPostFolder = (fsObject) => {
  return fsObject.children && fsObject.children.some(isFolderedPostIndexFile)
}

const newEntry = ({
  contentModel,
  key,
  entryFn,
  entry,
  liftEntries,
  replace
}) => {
  const _entry = entry || entryFn()
  const newContentModel = {
    ...contentModel,
    [key]: replace ? _entry : [
      ...contentModel[key],
      _entry
    ]
  }
  if (typeof liftEntries !== 'function') {
    return newContentModel
  }
  const { key: liftedEntriesKey, entries } = liftEntries(_entry)
  return {
    ...newContentModel,
    [liftedEntriesKey]: [
      ...newContentModel[liftedEntriesKey],
      ...entries
    ]
  }
}

const withAssets = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'assets',
    entryFn: () => createAssets(fsObject).data,
    replace: true
  })
}

const withSubpages = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'subpages',
    entryFn: () => {
      const subpages = createSubpages(fsObject)
      return subpages.data.map(({ data }) => data)
    },
    replace: true
  })
}

const withLocalAsset = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'localAssets',
    entryFn: () => createLocalAsset(fsObject)
  })
}

const withPost = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: () => createPost(fsObject).data
  })
}

const withDefaultCategoryPost = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: () => createDefaultCategoryPost(fsObject).data
  })
}

const withFolderedPost = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: () => {
      const newPost = createFolderedPost({
        ...fsObject,
        children: fsObject.children.map(mapFolderedPostTree)
      })
      return newPost.data
    }
  })
}

const withDefaultCategory = (contentModel) => {
  const defaultCategoryName = Dictionary.lookup('defaultCategoryName')
  const defaultCategory = contentModel.categories.find(
    category => category.name === defaultCategoryName
  )
  if (!defaultCategory) {
    return withCategory(contentModel, {
      name: defaultCategoryName,
      children: []
    })
  }
  return contentModel
}

const withCategory = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'categories',
    entryFn: () => {
      const newCategory = createCategory({
        ...fsObject,
        children: fsObject.children.map(mapCategoryTree)
      })
      return {
        ...newCategory.data,
        posts: newCategory.data.posts.map(({ data }) => data)
      }
    },
    liftEntries: (category) => {
      return {
        key: 'posts',
        entries: category.posts
      }
    }
  })
}

const mapCategoryTree = (fsObject) => {
  if (isPostFile(fsObject)) {
    return createPost(fsObject)
  }
  if (fsObject.children && fsObject.children.some(isFolderedPostIndexFile)) {
    return createFolderedPost({
      ...fsObject,
      children: fsObject.children.map(mapFolderedPostTree)
    })
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const mapFolderedPostTree = (fsObject) => {
  if (isFolderedPostIndexFile(fsObject)) {
    return createFolderedPostIndex(fsObject)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const createContentModel = (fsTree) => {
  const { pagesDirectory, assetsDirectory } = Settings.getSettings()
  return fsTree.reduce((contentModel, fsObject) => {
    if (isPostFile(fsObject)) {
      return withDefaultCategoryPost(
        withDefaultCategory(contentModel),
        fsObject
      )
    }
    if (!fsObject.children) {
      return withLocalAsset(contentModel, fsObject)
    }
    if (fsObject.name === pagesDirectory) {
      return withSubpages(contentModel, fsObject)
    }
    if (fsObject.name === assetsDirectory) {
      return withAssets(contentModel, fsObject)
    }
    if (fsObject.children.some(isFolderedPostIndexFile)) {
      return withFolderedPost(
        withDefaultCategory(contentModel),
        fsObject
      )
    }
    if (fsObject.children.some(c => isPostFile(c) || isPostFolder(c))) {
      return withCategory(contentModel, fsObject)
    }
    return contentModel
  }, {
    assets: [],
    subpages: [],
    categories: [],
    posts: [],
    localAssets: [],
    postsJSON: [],
    tags: []
  })
}

module.exports = createContentModel
