const makeSlug = require('slug')
const settings = require('../../../../settings').getSettings()

function tag(name, context) {
  return {
    name,
    permalink: (
      settings.permalinkPrefix +
      context.collection.slug + '/tags/' + makeSlug(name)
    )
  }
}

module.exports = tag
