const _ = require('lodash')
const { decorate } = require('../../../../decorations')
const { pipe } = require('../../../../helpers')
const { withDates, withLinkedPosts, withTags } = require('./enhancers')
const createModel = require('./createModel')

const createBlog = async (fileSystemTree, { foldered }) => {
  return pipe(await createModel(fileSystemTree, { foldered }), [
    async function blogWithDates(contentModel) {
      return {
        ...contentModel,
        categories: await Promise.all(
          contentModel.categories.map(async category => ({
            ...category,
            posts: await Promise.all(category.posts.map(withDates))
          }))
        ),
        posts: await Promise.all(
          contentModel.posts.map(withDates)
        )
      }
    },

    function blogWithSortedPosts (contentModel) {
      return {
        ...contentModel,
        categories: contentModel.categories.map(category => {
          return {
            ...category,
            posts: _.sortBy([...category.posts], 'publishDate')
          }
        }),
        posts: _.sortBy([...contentModel.posts], 'publishDate')
      }
    },

    // withLinkedPosts,

    function blogWithPostTags (contentModel) {
      return {
        ...contentModel,
        tags: withTags(contentModel.posts)
      }
    }
  ])
}

module.exports = {
  createBlog
}
