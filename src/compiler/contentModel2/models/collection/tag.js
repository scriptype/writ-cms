const { join } = require('path')
const makeSlug = require('slug')
const Settings = require('../../../../settings')

function tag(name, context) {
  const settings = Settings.getSettings()
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
