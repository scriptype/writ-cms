const _ = require('lodash')
const { getSlug } = require('../helpers')
const { UNCATEGORIZED } = require('../constants')
const Linker = require('./linking')
const mapFSIndexToContentTree = require('./fsToContent')
const contentTypes = require('./contentTypes')
const { createUncategorizedCategory, isPost, isLocalAsset } = contentTypes

const sortPosts = (a, b) => {
  return new Date(b.publishedAt) - new Date(a.publishedAt)
}

const upsertUncategorizedCategory = (ContentModel, newContent) => {
  const uncategorizedCategory = ContentModel.categories.find(
    category => category.name === UNCATEGORIZED
  )
  if (uncategorizedCategory) {
    uncategorizedCategory.posts.push(newContent)
    uncategorizedCategory.posts.sort(sortPosts)
  } else {
    ContentModel.categories.push(createUncategorizedCategory([newContent]).data)
  }
}

const createContentModel = (contentTree) => {
  const ContentModel = {
    assets: [],
    subpages: [],
    categories: [],
    posts: [],
    unrecognized: [],
    localAssets: [],
    postsJSON: []
  }

  contentTree.forEach(content => {
    switch (content.type) {
      case contentTypes.CATEGORY:
        if (content.data.posts.length) {
          content.data.posts.sort(sortPosts)
          ContentModel.categories.push({
            ...content.data,
            posts: content.data.posts.map(({ data }) => data)
          })
          ContentModel.posts.push(
            ...content.data.posts.map(({ data }) => data)
          )
        }
        break

      case contentTypes.POST:
        upsertUncategorizedCategory(ContentModel, content)
        ContentModel.posts.push(content.data)
        break

      case contentTypes.SUBPAGES:
        ContentModel.subpages.push(...content.data.map(({ data }) => data))
        break

      case contentTypes.ASSETS:
        ContentModel.assets.push(...content.data)
        break

      case contentTypes.LOCAL_ASSET:
        ContentModel.localAssets.push(content)
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
  createContentModel(fileSystemIndex) {
    const contentTree = mapFSIndexToContentTree(fileSystemIndex)
    const contentModel = createContentModel(contentTree)
    return Linker.link(contentModel)
  },
}
