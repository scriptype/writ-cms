const _ = require('lodash')
const Settings = require('../../settings')
const Dictionary = require('../../dictionary')
const { decorate } = require('../../decorations')
const { pipe } = require('../../helpers')
const mapFSTreeToContentTree = require('./fsToContent')
const contentTypes = require('./contentTypes')
const withLinkedPosts = require('./enhancers/links')
const withTaggedPosts = require('./enhancers/tags')
const withSortedPosts = require('./enhancers/sorting')
const withPostsJSON = require('./enhancers/postsJSON')
const { createCategory } = require('./models/category')

const upsertDefaultCategory = (ContentModel, newContent) => {
  const defaultCategoryName = Dictionary.lookup('defaultCategoryName')
  let defaultCategory = ContentModel.categories.find(
    category => category.name === defaultCategoryName
  )
  if (!defaultCategory) {
    defaultCategory = createCategory({
      name: defaultCategoryName,
      children: []
    }).data
    ContentModel.categories.push(defaultCategory)
  }
  defaultCategory.posts.push(newContent)
}

const createContentModel = (contentTree) => {
  const ContentModel = {
    assets: [],
    subpages: [],
    categories: [],
    posts: [],
    unrecognized: [],
    localAssets: [],
    postsJSON: [],
    tags: []
  }

  contentTree.forEach(content => {
    switch (content.type) {
      case contentTypes.CATEGORY:
        if (content.data.posts.length) {
          const categoryPosts = content.data.posts.map(({ data }) => data)
          ContentModel.categories.push({
            ...content.data,
            posts: categoryPosts
          })
          ContentModel.posts.push(...categoryPosts)
        }
        break

      case contentTypes.POST:
        upsertDefaultCategory(ContentModel, content.data)
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

  return ContentModel
}

module.exports = {
  async create(fileSystemTree, cache) {
    const contentTree = await mapFSTreeToContentTree(fileSystemTree, cache)
    const contentModel = pipe(contentTree, [
      createContentModel,
      withSortedPosts,
      withTaggedPosts,
      withLinkedPosts,
      withPostsJSON
    ])
    return decorate('contentModel', contentModel)
  },
}
