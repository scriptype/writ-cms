const { decorate } = require('../../decorations')
const { pipe } = require('../../helpers')
const mapFSTreeToContentTree = require('./fsToContent')
const withLinkedPosts = require('./enhancers/links')
const withTags = require('./enhancers/tags')
const withSortedPosts = require('./enhancers/sorting')
const withPostsJSON = require('./enhancers/postsJSON')

const create = async (fileSystemTree, cache) => {
  const contentModel = pipe(
    await mapFSTreeToContentTree(fileSystemTree, cache),
    [
      withSortedPosts,
      withTags,
      withLinkedPosts,
      withPostsJSON
    ]
  )
  return decorate('contentModel', contentModel)
}

module.exports = {
  create
}
