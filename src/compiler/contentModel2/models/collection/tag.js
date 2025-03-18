const { join } = require('path')
const makeSlug = require('slug')
const settings = require('../../../../settings').getSettings()

function tag(name, context) {
  const slug = makeSlug(name)
  const permalink = (
    settings.permalinkPrefix +
    context.collection.slug + '/tags/' + slug
  )
  const outputPath = join(
    settings.out,
    context.collection.slug,
    slug,
    'index.html'
  )
  return {
    name,
    slug,
    permalink
  }
}

module.exports = tag
