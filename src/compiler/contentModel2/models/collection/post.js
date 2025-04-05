const { join } = require('path')
const { parseArray } = require('../../helpers')
const models = {
  _baseEntry: require('../_baseEntry'),
  tag: require('./tag')
}

function post(node, context) {
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
    contentType: context.collection.entryContentType,
    tags: parseArray(baseEntryProps.tags).map(tagName => {
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
