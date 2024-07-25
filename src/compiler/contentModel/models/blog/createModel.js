const _ = require('lodash')
const Settings = require('../../../../settings')
const Dictionary = require('../../../../dictionary')
const { last } = require('../../../../helpers')

const {
  createHomepage,
  createFolderedHomepage,
  createFolderedHomepageIndex
} = require('../root/models/homepage')

const { createLocalAsset } = require('../root/models/localAsset')
const { createBlogIndex } = require('./models/blogIndex')

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

const isBlogIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^(blog|index)\..+$/)
}

const isFolderedPostIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^post\..+$/)
}

const isCategoryIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^category\..+$/)
}

const isHomepageFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^(homepage|home|index)\..+$/)
}

const isHomepageDirectory = (fsObject) => {
  const { homepageDirectory } = Settings.getSettings()
  const pattern = new RegExp(`^(${homepageDirectory}|homepage|home)$`)
  return fsObject.name.match(pattern)
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

const withHomepage = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'homepage',
    entryFn: () => createHomepage(fsObject).data,
    replace: true
  })
}

const withFolderedHomepage = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'homepage',
    entryFn: () => {
      const homepage = createFolderedHomepage({
        ...fsObject,
        children: fsObject.children.map(mapFolderedHomepageTree)
      })
      return homepage.data
    },
    replace: true
  })
}

const mapFolderedHomepageTree = (fsObject) => {
  if (isHomepageFile(fsObject)) {
    return createFolderedHomepageIndex(fsObject)
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

const withBlogIndex = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'blogIndex',
    entryFn: () => {
      return createBlogIndex(fsObject, contentModel._meta_).data
    },
    replace: true
  })
}

/*
 * Going through folderedBlog-concerning adjustments. e.g: withBlogIndex
 * */
const createContentModel = (fsTree, options = { foldered: false }) => {
  console.log('blog.createModel fsTree:', fsTree)
  return fsTree.children.reduce((contentModel, fsObject) => {
    if (contentModel.foldered && isBlogIndexFile(fsObject)) {
      return withBlogIndex(contentModel, fsObject)
    }
    if (!contentModel.foldered && isHomepageFile(fsObject)) {
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
    if (isHomepageDirectory(fsObject)) {
      return withFolderedHomepage(contentModel, fsObject)
    }
    if (fsObject.children.some(isFolderedPostIndexFile)) {
      return withDefaultCategory(
        withFolderedPost(contentModel, fsObject)
      )
    }
    return withCategory(contentModel, fsObject)
  }, {
    homepage: createHomepage({}).data,
    localAssets: [],
    categories: [],
    posts: [],
    tags: [],
    _meta_: {
      foldered: options.foldered,
      prefix: options.foldered ? fsTree.name : ''
    }
  })
}

module.exports = createContentModel
