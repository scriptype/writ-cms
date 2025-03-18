const { join } = require('path')
const settings = require('../../../../settings').getSettings()
const { parseTags } = require('../../helpers')
const models = {
  _baseEntry: require('../_baseEntry'),
  tag: require('./tag')
}

function post(node, context) {
  const baseEntryProps = models._baseEntry(node, ['index', 'post'])

  const permalink = (
    settings.permalinkPrefix +
    [
      context.collection.slug,
      context.category.isDefaultCategory ? '' : context.category.slug,
      baseEntryProps.slug
    ].filter(Boolean).join('/') +
    (node.children ? '' : '.html')
  )

  const outputPath = join(...[
    settings.out,
    context.collection.slug,
    (context.category.isDefaultCategory ? '' : context.category.slug),
    baseEntryProps.slug,
    (node.children ? 'index' : '')
  ].filter(Boolean)) + '.html'

  const postContext = {
    title: baseEntryProps.title,
    slug: baseEntryProps.slug,
    permalink
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
    outputPath,
    attachments: baseEntryProps.attachments.map(a => a({
      ...context,
      post: postContext
    }))
  }
}

module.exports = post
