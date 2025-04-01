const { join } = require('path')
const makeSlug = require('slug')
const Settings = require('../../../../settings')

function tag(name, context) {
  const settings = Settings.getSettings()
  const slug = makeSlug(name)
  const permalink = [context.collection.permalink, 'tags', slug].join('/')
  const outputPath = join(context.collection.outputPath, slug)
  return {
    name,
    slug,
    permalink,
    outputPath
  }
}

module.exports = tag
