const _ = require('lodash')
const Settings = require('../../settings')
const Dictionary = require('../../dictionary')
const { last } = require('../../helpers')
const { createLocalAsset } = require('./models/localAsset')
const { createAssets } = require('./models/asset')
const { createHomepage } = require('./models/homepage')

const {
  createCategory,
  createCategoryIndex
} = require('./models/category')

const {
  createSubpage,
  createFolderedSubpage,
  createFolderedSubpageIndex
} = require('./models/subpage')

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

const isFolderedSubpageIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^page\..+$/)
}

const isCategoryIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^category\..+$/)
}

const isHomepageFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^(homepage|home|index)\..+$/)
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

const withAssets = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'assets',
    entryFn: () => createAssets(fsObject).data,
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

const withHomepage = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'homepage',
    entryFn: () => createHomepage(fsObject).data,
    replace: true
  })
}

const withSubpages = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'subpages',
    entryFn: () => {
      const subpages = fsObject.children.map(mapSubpagesTree)
      return subpages.filter(Boolean).map(({ data }) => data)
    },
    replace: true
  })
}

const mapSubpagesTree = (fsObject) => {
  if (isTemplateFile(fsObject)) {
    return createSubpage(fsObject)
  }
  if (fsObject.children && fsObject.children.some(isFolderedSubpageIndexFile)) {
    return createFolderedSubpage({
      ...fsObject,
      children: fsObject.children.map(mapFolderedSubpageTree)
    })
  }
}

const mapFolderedSubpageTree = (fsObject) => {
  if (isFolderedSubpageIndexFile(fsObject)) {
    return createFolderedSubpageIndex(fsObject)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const withPost = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: () => createPost(fsObject).data
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

const withDefaultCategoryPost = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: () => createDefaultCategoryPost(fsObject).data
  })
}

const withDefaultCategory = (contentModel) => {
  const defaultCategoryName = Dictionary.lookup('defaultCategoryName')
  const post = _.cloneDeep(last(contentModel.posts))
  return upsertEntry({
    contentModel,
    key: 'categories',
    entryFn: (entry) => entry.name === defaultCategoryName,
    upsert: (entry) => {
      const defaultCategory = entry || createCategory({
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
    if (isHomepageFile(fsObject)) {
      return withHomepage(contentModel, fsObject)
    }
    if (isTemplateFile(fsObject)) {
      return withDefaultCategory(
        withDefaultCategoryPost(contentModel, fsObject)
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
      return withDefaultCategory(
        withFolderedPost(contentModel, fsObject)
      )
    }
    if (fsObject.children) {
      return withCategory(contentModel, fsObject)
    }
    return contentModel
  }, {
    assets: [],
    subpages: [],
    categories: [],
    posts: [],
    homepage: createHomepage().data,
    localAssets: [],
    postsJSON: [],
    tags: []
  })
}

module.exports = createContentModel
