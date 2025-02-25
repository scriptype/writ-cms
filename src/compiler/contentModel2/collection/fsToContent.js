const { dirname } = require('path')
const _ = require('lodash')
const Dictionary = require('../../../dictionary')
const { last } = require('../../../helpers')
const contentTypes = require('./contentTypes')
const { createLocalAsset } = require('../models/localAsset')

const {
  createCategory,
  createCategoryIndex
} = require('./models/category')

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

const isFolderedPostIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^post\..+$/)
}

const isCategoryIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^category\..+$/)
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

const upsertEntry = ({
  contentModel,
  key,
  entryFn,
  upsert
}) => {
  const collection = contentModel[key]
  const foundEntry = collection.find(entryFn)
  const newCollection = foundEntry ?
    collection.map(entry => entry === foundEntry ? upsert(foundEntry) : entry) :
    collection.concat(upsert())
  return {
    ...contentModel,
    [key]: newCollection
  }
}

const withLocalAsset = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'localAssets',
    entryFn: () => createLocalAsset(fsObject)
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

const mapFolderedPostTree = (fsObject) => {
  if (isFolderedPostIndexFile(fsObject)) {
    return createFolderedPostIndex(fsObject)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const withDefaultCategoryPost = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: () => createDefaultCategoryPost(fsObject).data
  })
}

const withDefaultCategory = (contentModel, fsObject) => {
  const defaultCategoryName = Dictionary.lookup('defaultCategoryName') || 'Unclassified'
  const post = _.cloneDeep(last(contentModel.posts))
  return upsertEntry({
    contentModel,
    key: 'categories',
    entryFn: (entry) => entry.name === defaultCategoryName,
    upsert: (entry) => {
      const defaultCategory = entry || createCategory({
        path: dirname(fsObject.path),
        name: defaultCategoryName,
        children: []
      }).data
      return {
        ...defaultCategory,
        posts: defaultCategory.posts.concat(post)
      }
    }
  })
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
  if (isCategoryIndexFile(fsObject)) {
    return createCategoryIndex(fsObject)
  }
  if (isTemplateFile(fsObject)) {
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

const mapCollectionTree = (fsTree) => {
  return fsTree.reduce((contentModel, fsObject) => {
    if (isTemplateFile(fsObject)) {
      return withDefaultCategory(
        withDefaultCategoryPost(contentModel, fsObject),
        fsObject
      )
    }
    if (!fsObject.children) {
      return withLocalAsset(contentModel, fsObject)
    }
    if (fsObject.children.some(isFolderedPostIndexFile)) {
      return withDefaultCategory(
        withFolderedPost(contentModel, fsObject),
        fsObject
      )
    }
    return withCategory(contentModel, fsObject)
  }, {
    categories: [],
    posts: [],
    localAssets: [],
    tags: []
  })
}

module.exports = mapCollectionTree
