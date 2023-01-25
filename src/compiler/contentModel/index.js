const { finaliseContent } = require('../../routines')
const { UNCATEGORIZED } = require('../constants')
const Linker = require('./linking')
const mapFSIndexToContentTree = require('./fsToContent')
const contentTypes = require('./contentTypes')

const sortPosts = (a, b) => {
  return new Date(b.publishedAt) - new Date(a.publishedAt)
}

const upsertUncategorizedCategory = (ContentModel, newContent) => {
  let uncategorizedCategory = ContentModel.categories.find(
    category => category.name === UNCATEGORIZED
  )
  if (!uncategorizedCategory) {
    uncategorizedCategory = contentTypes.createUncategorizedCategory().data
    ContentModel.categories.push(uncategorizedCategory)
  }
  uncategorizedCategory.posts.push(newContent)
  uncategorizedCategory.posts.sort(sortPosts)
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
    customTheme: null
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
        upsertUncategorizedCategory(ContentModel, content.data)
        ContentModel.posts.push(content.data)
        break

      case contentTypes.SUBPAGES:
        ContentModel.subpages.push(...content.data.map(({ data }) => data))
        break

      case contentTypes.CUSTOM_THEME_FOLDER:
        ContentModel.customTheme = {
          ...content.data
        }
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
    return finaliseContent(Linker.link(contentModel))
  },
}
