const { join } = require('path')
const makeSlug = require('slug')

function tag(name, context) {
  const slug = makeSlug(name)
  const permalink = [context.collection.permalink, 'tags', slug].join('/')
  const outputPath = join(context.collection.outputPath, 'tags', slug)
  return {
    name,
    slug,
    permalink,
    outputPath
  }
}

module.exports = tag
