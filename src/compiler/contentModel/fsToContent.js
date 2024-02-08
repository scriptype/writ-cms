const Settings = require('../../settings')
const Dictionary = require('../../dictionary')
const contentTypes = require('./contentTypes')
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

const mapFolderedPostTree = (fsObject) => {
  if (isFolderedPostIndexFile(fsObject)) {
    return createFolderedPostIndex(fsObject)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const mapCategoryTree = (cache) => (fsObject) => {
  if (isPostFile(fsObject)) {
    return createPost(fsObject, cache)
  }
  if (fsObject.children && fsObject.children.some(isFolderedPostIndexFile)) {
    return createFolderedPost({
      ...fsObject,
      children: fsObject.children.map(mapFolderedPostTree)
    }, cache)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const newEntry = async ({
  contentModel,
  key,
  entryFn,
  entry,
  liftEntries,
  replace
}) => {
  const _entry = entry || await entryFn()
  const newContentModel = {
    ...(await contentModel),
    [key]: replace ? _entry : [
      ...(await contentModel)[key],
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

const withFolderedPost = async (contentModel, fsObject, cache) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: async () => {
      const newPost = await createFolderedPost({
        ...fsObject,
        children: fsObject.children.map(mapFolderedPostTree)
      }, cache)
      return newPost.data
    }
  })
}

const withCategory = async (contentModel, fsObject, cache) => {
  return newEntry({
    contentModel,
    key: 'categories',
    entryFn: async () => {
      const newCategory = createCategory({
        ...fsObject,
        children: await Promise.all(
          fsObject.children.map(mapCategoryTree(cache))
        )
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

const withAssets = async (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'assets',
    entryFn: () => createAssets(fsObject).data,
    replace: true
  })
}

const withSubpages = async (contentModel, fsObject, cache) => {
  return newEntry({
    contentModel,
    key: 'subpages',
    entryFn: async () => {
      const subpages = await createSubpages(fsObject, cache)
      return subpages.data.map(({ data }) => data)
    },
    replace: true
  })
}

const withLocalAsset = async (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'localAssets',
    entryFn: () => createLocalAsset(fsObject)
  })
}

const withPost = async (contentModel, fsObject, cache) => {
  return newEntry({
    contentModel: await contentModel,
    key: 'posts',
    entryFn: async () => {
      const post = await createPost(fsObject, cache)
      return post.data
    }
  })
}

const withDefaultCategoryPost = async (contentModel, fsObject, cache) => {
  return newEntry({
    contentModel,
    key: 'posts',
    entryFn: async () => {
      const post = await createDefaultCategoryPost(fsObject, cache)
      return post.data
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

const mapFSTreeToContentModel = (fsTree, cache) => {
  const { pagesDirectory, assetsDirectory } = Settings.getSettings()
  return fsTree.reduce(async (contentModel, fsObject) => {
    if (isPostFile(fsObject)) {
      return withDefaultCategoryPost(
        withDefaultCategory(await contentModel),
        fsObject,
        cache
      )
    }
    if (!fsObject.children) {
      return withLocalAsset(await contentModel, fsObject)
    }
    if (fsObject.name === pagesDirectory) {
      return withSubpages(await contentModel, fsObject, cache)
    }
    if (fsObject.name === assetsDirectory) {
      return withAssets(await contentModel, fsObject)
    }
    if (fsObject.children.some(isFolderedPostIndexFile)) {
      return withFolderedPost(
        withDefaultCategory(await contentModel),
        fsObject,
        cache
      )
    }
    if (fsObject.children.some(isPostFile) || fsObject.children.some(isPostFolder)) {
      return withCategory(await contentModel, fsObject, cache)
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

module.exports = mapFSTreeToContentModel
