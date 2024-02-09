const { decorate } = require('../../decorations')
const { pipe } = require('../../helpers')
const createContentModel = require('./fsToContent')
const withDates = require('./enhancers/dates')
const withSortedPosts = require('./enhancers/sorting')
const withTags = require('./enhancers/tags')
const withLinkedPosts = require('./enhancers/links')
const withPostsJSON = require('./enhancers/postsJSON')

const create = async (fileSystemTree) => {
  const contentModel = pipe(await createContentModel(fileSystemTree), [
    withDates,
    withSortedPosts,
    withTags,
    withLinkedPosts,
    withPostsJSON
  ])
  return decorate('contentModel', contentModel)
}

module.exports = {
  create
}
