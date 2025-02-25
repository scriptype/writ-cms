const _ = require('lodash')
const { decorateSync } = require('../../../decorations')
const { getSlug, pipeSync } = require('../../../helpers')
const mapCollectionTree = require('./fsToContent')
const withDates = require('./enhancers/dates')
const withSortedPosts = require('./enhancers/sorting')
const withTags = require('./enhancers/tags')
const withLinkedPosts = require('./enhancers/links')

const createCollection = (fsObject) => {
  return {
    ..._.omit(fsObject, 'children'),
    type: 'collection',
    slug: getSlug(fsObject.name),
    ...pipeSync(mapCollectionTree(fsObject.children), [
      decorateSync.bind(null, 'contentModel'),
      withDates,
      withSortedPosts,
      withLinkedPosts,
      withTags,
    ])
  }
}

module.exports = {
  createCollection
}
