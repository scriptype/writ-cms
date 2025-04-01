const { join } = require('path')
const Settings = require('../../../../settings')
const { parseTags } = require('../../helpers')
const models = {
  _baseEntry: require('../_baseEntry'),
  tag: require('./tag')
}

function post(node, context) {
  const settings = Settings.getSettings()

  const baseEntryProps = models._baseEntry(node, ['index', 'post'])

  const permalink = [
    context.category.permalink,
    baseEntryProps.slug
  ].join('/') + (node.children ? '' : '.html')

  const outputPath = join(context.category.outputPath, baseEntryProps.slug)

  const postContext = {
    title: baseEntryProps.title,
    slug: baseEntryProps.slug,
    permalink,
    outputPath,
  }

  return {
    ...baseEntryProps,
    ...postContext,
    context,
    contentType: baseEntryProps.contentType || context.category.childContentType,
    tags: parseTags(baseEntryProps.tags).map(tagName => {
      return models.tag(tagName, context)
    }),
    date: new Date(baseEntryProps.date || baseEntryProps.stats.birthtime || Date.now()),
    attachments: baseEntryProps.attachments.map(a => a({
      ...context,
      post: postContext
    }))
  }
}

module.exports = post
