const { withDates } = require('../../../../enhancers')
const withTags = require('./tags')
const withLinkedPosts = require('./links')

module.exports = {
  withDates,
  withTags,
  withLinkedPosts
}
