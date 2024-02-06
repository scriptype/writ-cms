const Settings = require('../../settings')
const Dictionary = require('../../dictionary')
const { decorate } = require('../../decorations')
const Linker = require('./linking')
const mapFSIndexToContentTree = require('./fsToContent')
const contentTypes = require('./contentTypes')
const makeTagList = require('./tagList')

const sortPosts = (a, b) => {
  return new Date(b.publishDate) - new Date(a.publishDate)
}

const upsertDefaultCategory = (ContentModel, newContent) => {
  const defaultCategoryName = Dictionary.lookup('defaultCategoryName')
  let defaultCategory = ContentModel.categories.find(
    category => category.name === defaultCategoryName
  )
  if (!defaultCategory) {
    defaultCategory = contentTypes.createDefaultCategory(defaultCategoryName).data
    ContentModel.categories.push(defaultCategory)
  }
  defaultCategory.posts.push(newContent)
  defaultCategory.posts.sort(sortPosts)
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
          const sortedCategoryPosts = categoryPosts.sort(sortPosts)
          ContentModel.categories.push({
            ...content.data,
            posts: sortedCategoryPosts
          })
          ContentModel.posts.push(...sortedCategoryPosts)
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

  ContentModel.posts.sort(sortPosts)
  ContentModel.tags = makeTagList(ContentModel.posts)
  ContentModel.posts.forEach(post => {
    if (post.tags && post.tags.length) {
      post.tags = post.tags.map(tag => {
        const { posts, ...rest } = ContentModel.tags.find(t => t.tag === tag)
        return rest
      })
    }
  })
  ContentModel.postsJSON.push(
    ...ContentModel.posts.map(({ content, ...rest }) => rest)
  )

  return ContentModel
}

module.exports = {
  async createContentModel(fileSystemIndex, cache) {
    const contentTree = await mapFSIndexToContentTree(fileSystemIndex, cache)
    const contentModel = createContentModel(contentTree)
    const linkedContentModel = Linker.link(contentModel)
    return decorate('contentModel', linkedContentModel)
  },
}
